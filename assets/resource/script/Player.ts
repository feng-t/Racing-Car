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
    @property(cc.Label)
    dq: cc.Label = null;
    @property(cc.Label)
    startStr: cc.Label = null;
    @property(cc.Camera)
    Camera: cc.Camera
    /**
     * 轮胎轨迹
     */
    @property(cc.Prefab)
    c: cc.Prefab
    /**
     * 速度
     */
    @property()
    speed: number;
    /**
     * 最大速度
     */
    @property()
    MaxSpeed: number;
    /**
     * 加速时长
     */
    @property()
    speedTime: number = 1;
    //加速度
    a;
    //----------------------------------------------//
    //按键
    keyList = []
    //倒计时
    Countdown = 3;
    //计算时间
    Timeing: number;
    //游戏是否结束
    stop: boolean = true;
    dirRotation: number;
    body: cc.RigidBody;
    powerStorage: number = 0;//蓄力
    rota: any;
    //当前移动到的漂移节点
    region: cc.RopeJoint;
    //控制在反复调用的方法上只执行一次
    pm: boolean = false;
    //锚点位置
    vc: cc.Vec2;

    Accelerating: boolean = false

    left: cc.Node;
    right: cc.Node;
    enemyPool: cc.NodePool
    Track = []

    spt = 0;
    //----------------------------------------------//
    onLoad() {
        this.a = (this.MaxSpeed - this.speed) / this.speedTime
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;
        this.enemyPool = new cc.NodePool();
        this.node.zIndex = 10;

        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
            ;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    }

    start() {
        this.startStr.string = "游戏倒计时"
        this.dq.string = "0"
        this.schedule(this.strCall, 1)
        this.node.rotation = this.node.rotation >= 360 ? this.node.rotation / 360 : this.node.rotation
        this.body = this.getComponent(cc.RigidBody);
        this.left = this.node.getChildByName("left");// getComponent("")
        this.right = this.node.getChildByName("right");//this.getComponent("")
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        //前进方向
        this.dirRotation = this.node.rotation

    }
    onKeyUp(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.j:
                this.keyList[e.keyCode] = false
                break
            case cc.macro.KEY.f:
                this.keyList[e.keyCode] = false
                this.emitPower(false)
                break;
            case cc.macro.KEY.s:
                this.keyList[e.keyCode] = false
                break;
            case cc.macro.KEY.d:
                this.rota = 5;
                this.keyList[e.keyCode] = false;
            case cc.macro.KEY.a:
                this.rota = -5;
                this.keyList[e.keyCode] = false;
            default: break

        }
    }
    onKeyDown(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.f:
                this.keyList[e.keyCode] = true
                this.emitPower(true)
                break;
            case cc.macro.KEY.j:
                this.keyList[e.keyCode] = true;
                break;
            case cc.macro.KEY.s:
                this.keyList[e.keyCode] = true;
                this.stop = !this.stop;
                break;
            case cc.macro.KEY.d:
                this.rota = 5;
                this.keyList[e.keyCode] = true;
                break
            case cc.macro.KEY.a:
                this.rota = -5;
                this.keyList[e.keyCode] = true;
                break
            default: break
        }
    }

    update(dt) {

        this.dq.string = Math.floor(this.powerStorage).toString()
        if (this.Camera) {
            this.Camera.node.x = this.node.x
            this.Camera.node.y = this.node.y
        }
        // if (this.left && this.right) {
        //     console.log();
        // }
        if (this.region) {
            if (this.vc && this.keyList[cc.macro.KEY.j]) {
                //p 前进方向，朝向
                let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);
                p = this.region.node.rotation + p
                // let ps = p + 90;
                // this.dirRotation += (p + 90 - this.dirRotation)
                // this.dirRotation = this.dirRotation >= 360 ? this.dirRotation - (Math.floor(this.dirRotation / 360)) * 360 : this.dirRotation
                // console.log(this.dirRotation, p, this.node.rotation);

                p = this.region.node.rotation === 180 ? p + 60 : p + 120
                console.log(this.node.rotation, p);
                p = p >= 360 ? p - (Math.floor(p / 360)) * 360 : p
                console.log("r--->"+this.node.rotation, p);


                let r = this.node.rotation >= 360 ? this.node.rotation - (Math.floor(this.node.rotation / 360)) * 360 : this.node.rotation;
                r = (p - r)

                this.node.rotation += r;
                this.dirRotation += (this.node.rotation + (this.region.node.rotation === 180 ? 30 : -30) - this.dirRotation)
                //攒气 
                this.storgPower();


                if (this.Track.length < 20) {
                    let right = this.enemyPool.size() > 0 ? this.enemyPool.get() : cc.instantiate(this.c);
                    let left = this.enemyPool.size() > 0 ? this.enemyPool.get() : cc.instantiate(this.c);
                    right.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.right.getPosition())));
                    left.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.left.getPosition())));
                    this.node.parent.addChild(right);
                    this.node.parent.addChild(left);
                    this.Track.push(right)
                    this.Track.push(left)
                } else {//场上有20个

                    let right = this.Track.shift();
                    let left = this.Track.shift();
                    right.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.right.getPosition())));
                    left.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.left.getPosition())));
                    this.Track.push(right)
                    this.Track.push(left)
                }
                if (!this.Accelerating) {
                    this.speed = 100
                }
            }
        }
        this.move(dt);
    }
    move(dt) {
        var speed = this.body.linearVelocity;
        if (this.keyList[cc.macro.KEY.a] && this.keyList[cc.macro.KEY.d]) {
            // 避免同时按下两个键
        } else if (this.keyList[cc.macro.KEY.a] || this.keyList[cc.macro.KEY.d]) {
            this.node.rotation += this.rota //* 9;
        }
        if (this.stop) {
            return
        }
        // this.dirRotation = this.dirRotation >= 360 ? this.dirRotation - (Math.floor(this.dirRotation / 360)) * 360 : this.dirRotation
        this.dirRotation += (this.node.rotation - this.dirRotation) / 20


        // let y = ((this.keyList[cc.macro.KEY.f] || (this.keyList[cc.macro.KEY.j] && this.region)) ? 10 : 5) * Math.cos(this.dirRotation * Math.PI / 180)
        // let x = ((this.keyList[cc.macro.KEY.f] || (this.keyList[cc.macro.KEY.j] && this.region)) ? 10 : 5) * Math.sin(this.dirRotation * Math.PI / 180)

        /**
         * 速度,如果速度不等于最大速度，则需要在X时间内加速到这个速度
         */


        if (this.powerStorage < 100 && Math.abs(this.speed) > this.MaxSpeed) {
            this.speed = this.MaxSpeed;
        } else if (Math.abs(this.speed) < this.MaxSpeed) {
            this.speed += this.a * dt
        }
        speed.x = this.speed * Math.sin(this.dirRotation * Math.PI / 180);
        speed.y = this.speed * Math.cos(this.dirRotation * Math.PI / 180);
        this.body.linearVelocity = speed;



    }

    touch_start(c) {


        switch (c) {

            case 0:
                this.keyList[cc.macro.KEY.f] = false
                this.emitPower(false)
                break
            case 1:
                this.keyList[cc.macro.KEY.f] = true
                this.emitPower(true)
                break
            case 2:
                //漂移
                this.keyList[cc.macro.KEY.j] = true

                break
            case 3:
                this.keyList[cc.macro.KEY.j] = false

                break
        }
    }

    /**
     * 开始碰撞
     * @param other 
     * @param self 
     */
    onCollisionEnter(other, self) {
        this.region = other.getComponent(cc.RopeJoint);
        if (this.region && this.keyList[cc.macro.KEY.j]) {
            this.region.enabled = false;
            this.region.connectedBody = self.getComponent(cc.RigidBody);
            this.vc = cc.v2(
                other.node.convertToWorldSpaceAR(this.region.anchor).x - cc.view.getVisibleSize().width / 2,
                other.node.convertToWorldSpaceAR(this.region.anchor).y - cc.view.getVisibleSize().height / 2)
            this.region.maxLength = this.getVec2(this.vc, this.node)
            this.region.enabled = this.keyList[cc.macro.KEY.j];

            // let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);
            // p = this.region.node.rotation + p
            // p = this.region.node.rotation === 180 ? p + 60 : p + 120
            // p = p >= 360 ? p - (Math.floor(p / 360)) * 360 : p
            // let r = this.node.rotation >= 360 ? this.node.rotation - (Math.floor(this.node.rotation / 360)) * 360 : this.node.rotation;
            // r = (p - r)
            // this.node.rotation += r;
            // this.dirRotation += (this.node.rotation - this.dirRotation) / 20
        }
    }


    /**
    * TODO
    * 持续碰撞
    * @param other 
    * @param self
    */
    onCollisionStay(other, self) {



        //设置在直道上保持直行
        if (!this.region) {
            // p = (this.region.node.rotation > 90 || this.region.node.rotation < -90) ? p - 90 : p + 90
            this.node.rotation += (other.node.rotation - this.node.rotation) / 20
        }

        if (this.keyList[cc.macro.KEY.j]) {
            let region = other.getComponent(cc.RopeJoint);
            this.region = region ? region : this.region;
            if (this.region && !this.pm) {
                this.pm = this.keyList[cc.macro.KEY.j];
                // this.region.enabled = this.keyList[cc.macro.KEY.j]
                this.region.enabled = false;
                this.region.connectedBody = self.getComponent(cc.RigidBody);
                this.vc = cc.v2(
                    other.node.convertToWorldSpaceAR(this.region.anchor).x - cc.view.getVisibleSize().width / 2,
                    other.node.convertToWorldSpaceAR(this.region.anchor).y - cc.view.getVisibleSize().height / 2)
                this.region.maxLength = this.getVec2(this.vc, this.node)
                this.region.enabled = this.keyList[cc.macro.KEY.j]
            }
        } else {
            if (this.region && !this.keyList[cc.macro.KEY.j]) {

                this.region.enabled = false;
                this.pm = false
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
    /**
     * 计算两个向量的距离
     * @param c1 
     * @param c2 
     */
    getVec2(c1: any, c2: any) {
        return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
    }
    //回调函数
    strCall = function () {
        if (this.Countdown === 0) {
            this.stop = false;
            this.startStr.node.destroy();
            // 取消这个计时器
            this.unschedule(this.strCall);
            return
        }
        this.startStr.string = this.Countdown

        this.Countdown--;
    }
    //积攒氮气
    storgPower() {
        if (this.Accelerating) {
            return
        }
        this.powerStorage = this.powerStorage < 100 ? this.powerStorage + 0.5 : 100
    }
    /**
     * 使用氮气加速
     * @param b 取消与使用
     */
    emitPower(b: boolean) {
        if (b) {
            if (this.powerStorage === 100) {
                this.speed = this.MaxSpeed + this.MaxSpeed * 0.2
                this.Accelerating = true;
                this.schedule(this.power, 0.05)
            }
        } else {
            this.speed = this.MaxSpeed
        }
    }
    power = function () {
        this.powerStorage--;
        if (this.powerStorage === 0) {
            this.unschedule(this.power);
            this.Accelerating = false
            // this.pauseTarget(this.power)
        }
    }
}
