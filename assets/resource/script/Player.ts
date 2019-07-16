import Main from "./Main";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Player extends cc.Component {


    @property(cc.Camera)
    private Camera: cc.Camera = null
    @property({
        type: cc.Node,
        tooltip: "开始节点"
    })
    private StartNode: cc.Node = null
    // @property(cc.Node)
    // private SpeedNode: cc.Node = null
    /**
     * 轮胎轨迹
     */
    @property({
        type: cc.Prefab,
        tooltip: "轮胎轨迹"
    })
    private c: cc.Prefab = null
    /**
     * 速度
     */
    @property({
        tooltip: "速度"
    })
    private speed: number = 0
    /**
     * 最大速度
     */
    @property({
        tooltip: "最大速度"
    })
    private MaxSpeed: number = 400
    /**
     * 加速时长
     */
    @property({
        tooltip: "加速时间"
    })
    private speedTime: number = 1;
    // @property({
    //     tooltip: "bgm"
    // })
    // private bgm: cc.AudioClip = null
    //加速度
    a;
    //----------------------------------------------//
    //按键
    keyList = []
    //倒计时
    Countdown = 3;
    //计算时间
    Timeing: number = 0;

    rSpeed: number = 0;
    dirRotation: number;
    body: cc.RigidBody;
    powerStorage: number = 0;//蓄力
    rota: any;
    //当前移动到的漂移节点
    region: cc.RopeJoint;

    //锚点位置
    vc: cc.Vec2;
    //游戏是否结束
    stop: boolean = true;
    ring: number = -1
    //控制在反复调用的方法上只执行一次
    pm: boolean = false;

    Accelerating: boolean = false

    left: cc.Node;
    right: cc.Node;
    enemyPool: cc.NodePool
    Track = []
    //----------------------------------------------//
    onLoad() {
        this.a = (this.MaxSpeed - this.speed) / this.speedTime
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;
        this.enemyPool = new cc.NodePool();
        this.node.zIndex = 10;

        cc.loader.loadRes("/map/游戏BGM1",cc.AudioClip,function(err,clip){
            if (err) {
                return
            }
            // console.log("加载完成");
            // console.log(err,clip);
            
            cc.audioEngine.playMusic(clip,true);
        })

        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
            ;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    }

    start() {
        // this.startStr.string = "游戏倒计时"
        // this.dq.string = "0"
        // this.schedule(this.strCall, 1)
        this.node.rotation = this.node.rotation >= 360 ? this.node.rotation / 360 : this.node.rotation
        this.body = this.getComponent(cc.RigidBody);
        this.left = this.node.getChildByName("left");// getComponent("")
        this.right = this.node.getChildByName("right");//this.getComponent("")
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        //前进方向
        this.dirRotation = this.node.rotation
        this.onEvent();
    }
    onEvent() {
        this.node.on("gameStart", function () {
            //游戏开始
            this.stop = false
        }, this);
    }

    update(dt) {

        //氮气
        // this.dq.string = Math.floor(this.powerStorage).toString()
        if (this.Camera) {
            this.Camera.node.x = this.node.x
            this.Camera.node.y = this.node.y
        }
        // if (this.left && this.right) {
        //     console.log();
        // }
        if (this.region) {
            if (this.vc && this.keyList[cc.macro.KEY.j]) {
                this.Camera.zoomRatio += (1.2 - this.Camera.zoomRatio) / 10

                let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);
                // console.log(p,this.node.rotation);

                p = this.region.node.rotation === 180 ? p - 120 : p + 120

                this.node.rotation = Math.abs(this.node.rotation) >= 360 ? this.node.rotation - (Math.floor(this.node.rotation / 360)) * 360 : this.node.rotation;
                this.node.rotation += (p - this.node.rotation);
                // this.node.rotation += (this.region.node.rotation === 180 ? - 90 : 90)
                this.dirRotation += (this.node.rotation - this.dirRotation)

                // let r = this.node.rotation >= 360 ? this.node.rotation - (Math.floor(this.node.rotation / 360)) * 360 : this.node.rotation;
                // r = (p - r)

                // this.node.rotation += r;
                this.dirRotation += (this.node.rotation + (this.region.node.rotation === 180 ? 30 : -30) - this.dirRotation)
                //攒气 
                this.storgPower();
                //留下轮胎印
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

                    if (this.speed > 100) {

                        this.rSpeed = this.speed - this.a * dt

                    } else {
                        this.rSpeed = 100

                    }
                    this.speed = this.rSpeed
                }
            }
        } else
            this.Camera.zoomRatio += (1 - this.Camera.zoomRatio) / 10

        this.move(dt);
    }
    move(dt) {
        this.dirRotation += (this.node.rotation - this.dirRotation) / 20
        var speed = this.body.linearVelocity;
        if (this.stop) {
            return
        }

        if (!this.Accelerating && Math.abs(this.speed) > this.MaxSpeed) {
            this.speed = this.MaxSpeed;
        } else if (Math.abs(this.speed) < this.MaxSpeed) {
            if (!(this.region && this.vc && this.keyList[cc.macro.KEY.j])) {
                this.speed += this.a * dt

            }
        }
        speed.x = this.speed * Math.sin(this.dirRotation * Math.PI / 180);
        speed.y = this.speed * Math.cos(this.dirRotation * Math.PI / 180);
        this.body.linearVelocity = speed;

        this.node.emit("speed", this.speed)

    }

    touch_start(c) {


        switch (c) {

            case 0:
                this.keyList[cc.macro.KEY.f] = false
                this.emitPower()
                break
            case 1:
                this.keyList[cc.macro.KEY.f] = true
                this.emitPower()
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
        if (other.node === this.StartNode) {
            this.ring++;
            console.log("第" + this.ring + "圈");

        }



        // this.node.emit("test",function(){
        //     console.log("------------");

        // })
        this.region = other.getComponent(cc.RopeJoint);
        if (this.region) {


            this.region.enabled = false;
            this.region.connectedBody = self.getComponent(cc.RigidBody);
            this.vc = other.node.parent.parent.convertToNodeSpaceAR(other.node.convertToWorldSpaceAR(this.region.anchor))
            this.region.maxLength = this.getVec2(this.vc, this.node)
            this.region.enabled = this.keyList[cc.macro.KEY.j];

            let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);

            // console.log(p, this.node.rotation);

        }
        // if (this.region && this.keyList[cc.macro.KEY.j]) {


        //     this.region.enabled = false;
        //     this.region.connectedBody = self.getComponent(cc.RigidBody);
        //     this.vc = other.node.parent.parent.convertToNodeSpaceAR(other.node.convertToWorldSpaceAR(this.region.anchor))
        //     this.region.maxLength = this.getVec2(this.vc, this.node)
        //     this.region.enabled = this.keyList[cc.macro.KEY.j];

        //     let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);

        //     console.log(p, this.node.rotation);

        // }
    }


    /**
    * TODO
    * 持续碰撞
    * @param other 
    * @param self
    */
    onCollisionStay(other, self) {

        // console.log(this.node.rotation);

        //设置在直道上保持直行
        if (!this.region) {
            this.node.rotation += (other.node.rotation - this.node.rotation)
            this.dirRotation = other.node.rotation
        }

        if (this.keyList[cc.macro.KEY.j]) {
            let region = other.getComponent(cc.RopeJoint);
            this.region = region ? region : this.region;
            if (this.region && !this.pm) {
                this.pm = this.keyList[cc.macro.KEY.j];
                // this.region.enabled = this.keyList[cc.macro.KEY.j]
                this.region.enabled = false;
                this.region.connectedBody = self.getComponent(cc.RigidBody);
                // this.vc = cc.v2(
                //     other.node.convertToWorldSpaceAR(this.region.anchor).x - cc.view.getVisibleSize().width / 2,
                //     other.node.convertToWorldSpaceAR(this.region.anchor).y - cc.view.getVisibleSize().height / 2)
                this.vc = other.node.parent.parent.convertToNodeSpaceAR(other.node.convertToWorldSpaceAR(this.region.anchor))
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
        this.rSpeed = 0
    }
    /**
     * 计算两个向量的距离
     * @param c1 
     * @param c2 
     */
    getVec2(c1: any, c2: any) {
        return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
    }



    //积攒氮气
    storgPower() {
        if (this.Accelerating) {
            return
        }
        this.powerStorage = this.powerStorage < 100 ? this.powerStorage + 0.5 : 100
        this.node.emit("storgPower", Math.floor(this.powerStorage).toString())//发射事件，正在攒气
    }
    /**
     * 使用氮气加速
     * @param b 取消与使用
     */
    emitPower() {

        if (this.powerStorage === 100) {
            this.speed = this.MaxSpeed * 1.2
            this.Accelerating = true;
            this.schedule(this.power, 0.05)
        }

    }
    power = function () {
        this.powerStorage--;
        if (this.powerStorage === 0) {
            this.unschedule(this.power);
            this.Accelerating = false
            this.speed = this.MaxSpeed
        }
        this.node.emit("storgPower", this.powerStorage)
    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.j:
                this.keyList[e.keyCode] = false
                break
            case cc.macro.KEY.f:
                this.keyList[e.keyCode] = false

                break;
            case cc.macro.KEY.s:
                this.keyList[e.keyCode] = false
                break;
            case cc.macro.KEY.d:
                // this.rota = 5;
                this.keyList[e.keyCode] = false;
            case cc.macro.KEY.a:
                // this.rota = -5;
                this.keyList[e.keyCode] = false;
            default: break

        }
    }
    onKeyDown(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.f:
                this.keyList[e.keyCode] = true
                this.emitPower()
                break;
            case cc.macro.KEY.j:
                this.keyList[e.keyCode] = true;
                break;
            case cc.macro.KEY.s:
                this.keyList[e.keyCode] = true;
                this.stop = !this.stop;
                break;
            case cc.macro.KEY.d:
                // this.rota = 5;
                this.keyList[e.keyCode] = true;
                break
            case cc.macro.KEY.a:
                // this.rota = -5;
                this.keyList[e.keyCode] = true;
                break
            default: break
        }
    }
}
