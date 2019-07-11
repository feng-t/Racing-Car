// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property
    MoveSpeed = 5//玩家移动速度 
    @property(cc.Label)
    le: cc.Label;
    @property(cc.Camera)
    Camera: cc.Camera;


    dirRotation: number = 0;//运动方向
    rotas: number = 0;
    pm: boolean = false;
    stop = true;
    body: cc.RigidBody;
    vc: cc.Vec2;
    region: cc.RopeJoint;
    count = 3;
    //按键
    keyList = []

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
            ;
    }
    callback = function () {
        if (this.count === 0) {
            this.stop = false;
            // this.le.node.active = false;
            this.le.node.destroy();
            // 在第六次执行回调时取消这个计时器
            this.unschedule(this.callback);
        }
        this.le.string = this.count

        this.count--;
    }
    start() {
        this.le.string = "游戏倒计时";

        this.schedule(this.callback, 1);
        // this.Camera = cc.Camera.findCamera(this.node)
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;


        this.dirRotation = this.node.rotation;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.body = this.getComponent(cc.RigidBody);
        // this.collider.node.on(cc.Node.EventType.TOUCH_START,this.onCollisionEnter)
    }

    update(dt: any) {
        if (this.region) {
            if (this.vc && this.keyList[32]) {
                let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);
                p = this.region.node.rotation + p + 90
                this.node.rotation += (p - this.node.rotation) / 2
            }
        }
        this.move()
    }

    //移动
    move() {
        var speed = this.body.linearVelocity;

        if (this.keyList[cc.macro.KEY.a] && this.keyList[cc.macro.KEY.d]) {
            // 避免同时按下两个键
        } else if (this.keyList[cc.macro.KEY.a] || this.keyList[cc.macro.KEY.d]) {
            this.node.rotation += this.rotas //* 9;
        }
        this.dirRotation += (this.node.rotation - this.dirRotation) / 2
        if (this.stop) {
            return
        }

        let x = (this.keyList[cc.macro.KEY.w] ? 10 : 5) * Math.cos(this.dirRotation * Math.PI / 180)
        let y = (this.keyList[cc.macro.KEY.w] ? 10 : 5) * Math.sin(this.dirRotation * Math.PI / 180)
        // let sx = this.node.x;// += y;// = this.node.x - x;
        // let sy = this.node.y;// += x;// = this.node.y + y;
        // const action = cc.moveTo(1, sx + y, sy + x);
        // this.node.runAction(action);

        speed.x += y * 2;
        speed.y += x * 2;
        this.body.linearVelocity = speed;

    }
    /**
     * 开始碰撞
     * @param other 
     * @param self 
     */
    onCollisionEnter(other, self) {
        this.region = other.getComponent(cc.RopeJoint);
        if (this.region && this.keyList[32]) {
            this.region.enabled = false;
            this.region.connectedBody = self.getComponent(cc.RigidBody);
            this.vc = cc.v2(
                other.node.convertToWorldSpaceAR(this.region.anchor).x - cc.view.getVisibleSize().width / 2,
                other.node.convertToWorldSpaceAR(this.region.anchor).y - cc.view.getVisibleSize().height / 2)
            this.region.maxLength = this.getVec2(this.vc, this.node)
            this.region.enabled = this.keyList[32];
        }
    }
    /**
     * 获取父节点下的子节点的世界坐标
     * @param node 
     * @param ds 
     */
    getWordXY(node, ds: cc.Vec2) {
        return cc.v2(
            node.convertToWorldSpaceAR(ds).x - cc.view.getVisibleSize().width / 2,
            node.convertToWorldSpaceAR(ds).y - cc.view.getVisibleSize().height / 2
        )

    }
    /**
     * 计算两个向量的距离
     * @param c1 
     * @param c2 
     */
    getVec2(c1: any, c2: any) {
        return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
    }
    /**
     * TODO
     * 持续碰撞
     * @param other 
     * @param self
     */
    onCollisionStay(other, self) {
        // if (!this.region) {
        //     let p = Math.atan2(this.node.x - other.node.x, this.node.y - other.node.y) * (180 / Math.PI);
        //     p = other.node.rotation + p
        //     // p = (this.region.node.rotation > 90 || this.region.node.rotation < -90) ? p - 90 : p + 90
        //     this.node.rotation += (p - this.node.rotation) / 2
        // }
        if (this.keyList[32]) {
            let region = other.getComponent(cc.RopeJoint);
            this.region = region ? region : this.region;
            if (this.region && !this.pm) {

                this.pm = this.keyList[32];
                this.region.enabled = this.keyList[32]
                this.region.enabled = false;
                this.region.connectedBody = self.getComponent(cc.RigidBody);
                this.vc = cc.v2(
                    other.node.convertToWorldSpaceAR(this.region.anchor).x - cc.view.getVisibleSize().width / 2,
                    other.node.convertToWorldSpaceAR(this.region.anchor).y - cc.view.getVisibleSize().height / 2)
                this.region.maxLength = this.getVec2(this.vc, this.node)
                this.region.enabled = this.keyList[32];


                // if (this.keyList[32]) {

                //     let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);
                //     p = this.region.node.rotation + p + 90
                //     this.node.rotation += (p - this.node.rotation) / 2

                // }

            }
        }

    }
    /**
     * 结束碰撞
     * @param other 碰撞到的物体
     * @param self 自己
     */
    onCollisionExit(other, self) {
        this.region = null;
        this.pm = false;
        var joint: cc.RopeJoint = other.getComponent(cc.RopeJoint);
        if (joint) {
            joint.enabled = false;
        }
    }
    // 物理碰撞，只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider, otherCollider) {

    }
    onKeyUp(e) {

        switch (e.keyCode) {
            case 32: if (this.region) {
                this.region.enabled = false
                this.pm = false
            }
                this.keyList[e.keyCode] = false
                break
            case cc.macro.KEY.a:
                //左转
                this.keyList[e.keyCode] = false
                break;

            case cc.macro.KEY.d:
                //右转
                this.keyList[e.keyCode] = false
                break;
            case cc.macro.KEY.w:
                //前进
                this.keyList[e.keyCode] = false
                break;
            case cc.macro.KEY.s:
                //后退
                this.keyList[e.keyCode] = false
                break;
            default: break
        }
    }
    onKeyDown(e: { keyCode: any; }) {

        switch (e.keyCode) {
            case 32:
                this.keyList[e.keyCode] = true
                break;
            case cc.macro.KEY.a:
                this.keyList[e.keyCode] = true;
                this.rotas = -1;
                break;
            case cc.macro.KEY.d:
                this.keyList[e.keyCode] = true;
                this.rotas = 1;
                //右转
                break;
            case cc.macro.KEY.w:
                //前进
                this.keyList[e.keyCode] = true;
                this.stop = false;
                break;
            case cc.macro.KEY.s:
                this.stop = true;
                this.keyList[e.keyCode] = true;
                //后退
                break;
            default: break
        }
        // if (this.vc && this.region.enabled && this.keyList[32]) {
        //     const p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y)  * (180 / Math.PI)-90;
        //     // this.node.runAction(cc.rotateBy(0.1,  +)
        //     this.node.rotation += (this.node.rotation - p)
        // }
    }

}
