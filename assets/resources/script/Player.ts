import Main from "./Main";
import { Music } from "./Music";
import { CusEvent } from "./entity/CusEvent";

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
    private gui: cc.Prefab = null
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
    private speedTime: number = 1.5;
    dt: number;
    @property({
        tooltip: "氮气积攒时间"
    })
    private powerTime: number = 3;
    // @property({
    //     tooltip: "bgm"
    // })
    // private bgm: cc.AudioClip = null
    //加速度
    a;
    powerA: number;
    //----------------------------------------------//
    //按键
    keyList = new Map()
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
    /**
     * 正在使用气
     */
    Accelerating: boolean = false
    /**
     * 漂移
     */
    startdrift: boolean = false
    down: boolean = true;
    left: cc.Node;
    right: cc.Node;
    enemyPool: cc.NodePool
    Track = []
    /**
     * 状态
     */

    coll = [];
    oth
    /**
     * 状态列表
     */
    NewState: any
    OldState: any
    stateEumm = {
        stop: "stop",
        /**
         * 漂移
         */
        drift: "drift",
        /**
         * 驱动
         */
        drive: "drive",

    }
    MaxZoomRatio: number = 0.5;
    MinZoomRatio: number = 0.3;
    //----------------------------------------------//
    onLoad() {
        console.log(this.stateEumm.stop);

        this.a = (this.MaxSpeed - this.speed) / this.speedTime
        this.powerA = (100 - this.powerStorage) / this.powerTime

        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;
        this.enemyPool = new cc.NodePool();
        this.node.zIndex = 10;

        /**
         * 显示物理边框
         */
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_pairBit |
        //     cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
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
    /**
     * 事件检测
     */
    onEvent() {
        this.node.on("gameStart", function () {
            //游戏开始
            this.stop = false
            if (Main.Music.get(Music.MapMusics.driving)) {
                Music.PlayMusics.set(Music.MapMusics.driving, cc.audioEngine.playEffect(Main.Music.get(Music.MapMusics.driving), true));
            }
        }, this);
        this.node.on(CusEvent.drift, function () {
            if (!this.pm) {
                // Music.playEffectMusic(Music.MapMusics.startdrift, false)
            }
        }, this)

        this.node.on(CusEvent.stat, function (v1, v2) {
            switch (v2) {
                case this.stateEumm.drift:
                    Music.playEffectMusic(Music.MapMusics.startdrift, true)
                    break
                case this.stateEumm.drive:
                    Music.playEffectMusic(Music.MapMusics.driving, true)
                    break
                case this.stateEumm.stop:

                    break
            }
        }, this)

    }

    update(dt) {
        this.dt = dt;
        if (this.Camera) {
            this.Camera.node.x = this.node.x
            this.Camera.node.y = this.node.y
        }
        if (!Main.musicSwitch) {
            cc.audioEngine.stopAll();
        }
        this.drift(dt);
        this.move(dt);
        this.statusChang();
    }
    /**
     * 发射状态改变的事件
     * 
     */
    statusChang() {
        if (this.OldState !== this.NewState) {
            let stat = this.NewState
            //状态发生改变
            this.node.emit(CusEvent.stat, this.OldState, stat);
            this.OldState = stat
        }
    }
    drift(dt) {

        if (!this.startdrift) {
            Music.Music(Music.getAudioID(Music.MapMusics.startdrift), Music.Operating.pause)
        }
        if (this.region) {
            if (this.vc && this.keyList.get(cc.macro.KEY.j)) {
                this.NewState = this.stateEumm.drift;
                /**
                 * 180就是逆时针旋转，否则就是顺时针旋转
                 */
                let type = this.region.node.name.substring(this.region.node.name.length - 3, this.region.node.name.length);
                this.startdrift = true;
                this.Camera.zoomRatio += (this.MaxZoomRatio - this.Camera.zoomRatio) / 10
                let p = Math.atan2(this.node.x - this.vc.x, this.node.y - this.vc.y) * (180 / Math.PI);
                p = type === "180" ? p - 120 : p + 120
                this.node.rotation = Math.abs(this.node.rotation) >= 360 ? this.node.rotation - (Math.floor(this.node.rotation / 360)) * 360 : this.node.rotation;
                this.node.rotation += (p - this.node.rotation);
                this.dirRotation += (this.node.rotation - this.dirRotation)
                this.dirRotation += (this.node.rotation + (type === "180" ? 30 : -30) - this.dirRotation)
                //攒气 
                this.storgPower(dt);
                //留下轮胎印
                if (this.Track.length < 20) {
                    let right = this.enemyPool.size() > 0 ? this.enemyPool.get() : cc.instantiate(this.gui);
                    let left = this.enemyPool.size() > 0 ? this.enemyPool.get() : cc.instantiate(this.gui);
                    right.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.right.getPosition())));
                    left.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.left.getPosition())));
                    this.node.parent.addChild(right);
                    this.node.parent.addChild(left);
                    this.Track.push(right)
                    this.Track.push(left)
                } else {//20个轮胎印

                    let right = this.Track.shift();
                    let left = this.Track.shift();
                    right.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.right.getPosition())));
                    left.setPosition(this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.left.getPosition())));
                    this.Track.push(right)
                    this.Track.push(left)
                }
                if (!this.Accelerating) {
                    let cp = 400;
                    if (this.speed > cp) {
                        this.rSpeed = this.speed - ((this.a * dt) / 2)
                    } else {
                        this.rSpeed = cp
                    }
                    this.speed = this.rSpeed
                }
            }
        } else {
            this.startdrift = false;
            this.NewState = this.stateEumm.drive;
            this.Camera.zoomRatio += (this.MinZoomRatio - this.Camera.zoomRatio) / 10
        }
    }
    move(dt) {
        this.node.emit(CusEvent.emit_speed, this.speed)
        this.dirRotation += (this.node.rotation - this.dirRotation) / 20
        var speed = this.body.linearVelocity;
        if (this.stop) {
            this.speed += (0 - this.speed) / 10;
            this.NewState = this.stateEumm.stop
            return
        }
        if (!this.Accelerating && Math.abs(this.speed) > this.MaxSpeed) {
            this.speed = this.MaxSpeed;
        } else if (Math.abs(this.speed) < this.MaxSpeed) {
            if (!(this.region && this.vc && this.keyList.get(cc.macro.KEY.j))) {
                this.speed += this.a * dt
            }
        }
        speed.x = this.speed * Math.sin(this.dirRotation * Math.PI / 180);
        speed.y = this.speed * Math.cos(this.dirRotation * Math.PI / 180);
        this.body.linearVelocity = speed;
    }

    touch_start(c) {
        switch (c) {
            case 0:
                this.keyList.set(cc.macro.KEY.f, false)
                this.emitPower()
                break
            case 1:
                this.keyList.set(cc.macro.KEY.f, true)
                this.emitPower()
                this.zoom();
                break
            case 2:
                //漂移
                this.keyList.set(cc.macro.KEY.j, true)
                break
            case 3:
                this.keyList.set(cc.macro.KEY.j, false)
                break
        }
    }

    /**
     * 开始碰撞
     * @param other 
     * @param self 
     */
    onCollisionEnter(other, self) {
        // console.log("dd");

        if (this.coll.indexOf(other) === -1) {
            this.coll.push(other)
        }
        this.oth = this.oth ? this.oth : this.coll[0]
        if (other.node === this.StartNode) {
            this.ring++;
            console.log("第" + this.ring + "圈");
        }
    }


    /**
    * TODO  
    * 持续碰撞
    * @param other 
    * @param self
    */
    onCollisionStay(other, self) {

        console.log(this.oth.node.name);

        if (this.coll.length > 1) {
            if (!this.keyList.get(cc.macro.KEY.j)) {
                /**
                 * 松开就到这里
                 */
                let s = this.oth
                this.coll.forEach((v, i, []) => {
                    if (!Player.isJoint(v)) {
                        s = v
                    }
                })
                this.oth = s;
                this.down = false;
            } else {
                /**
                 * 转换到最外层
                 */
                if (!this.down) {
                    let s = -1
                    this.coll.forEach((v, i, []) => {
                        if (Player.isJoint(v)) {
                            s = s > i ? s : i;
                        }
                    })
                    this.oth = s > -1 ? this.coll[s] : this.oth;
                    this.down = true;
                }

            }
        } else {

            if (this.coll.length > 0) {
                this.oth = this.coll[0];
            }
        }
        // console.log(this.oth.node.name,Player.isJoint(this.oth));

        //强行纠正
        if (!this.keyList.get(cc.macro.KEY.j)) {
            if (!Player.isJoint(this.oth)) {
                if (this.oth.node.rotation < 0 && this.node.rotation > 0) {
                    let ro = this.node.rotation - 360;
                    let dir = this.dirRotation - 360;
                    if (Math.abs(this.oth.node.rotation - this.node.rotation) > Math.abs(this.oth.node.rotation - ro)) {
                        this.node.rotation = ro;
                        this.dirRotation = dir;
                    }

                } else if (this.oth.node.rotation > 0 && this.node.rotation < 0) {
                    let ro = this.node.rotation + 360;
                    let dir = this.dirRotation + 360;
                    if (Math.abs(this.oth.node.rotation - this.node.rotation) > Math.abs(this.oth.node.rotation - ro)) {
                        this.node.rotation = ro;
                        this.dirRotation = dir;
                    }

                }

                this.node.rotation += (this.oth.node.rotation - this.node.rotation) / 10
                this.dirRotation += (this.oth.node.rotation - this.dirRotation) / 10
                if (this.keyList.get(cc.macro.KEY.j)) {
                    this.node.rotation += 5;
                    this.dirRotation += 5;
                }
            }
        }

        if (this.keyList.get(cc.macro.KEY.j)) {
            let region = this.oth.getComponent(cc.RopeJoint);
            this.region = region ? region : this.region;
            if (this.region && !this.pm) {
                this.pm = this.keyList.get(cc.macro.KEY.j);
                this.region.connectedBody = self.getComponent(cc.RigidBody);
                this.vc = this.oth.node.parent.parent.convertToNodeSpaceAR(this.oth.node.convertToWorldSpaceAR(this.region.anchor))
                this.region.maxLength = this.getVec2(this.vc, this.node)
                this.region.enabled = this.keyList.get(cc.macro.KEY.j)
            }
        } else {
            if (this.region && !this.keyList.get(cc.macro.KEY.j)) {
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
        
        this.node.emit(CusEvent.outNode, other,this.coll[this.coll.length-1])

        let i = -1;
        if ((i = this.coll.indexOf(other)) > -1) {
            this.coll.splice(i, 1)
        }

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

    private static isJoint(node) {
        return node.getComponent(cc.Joint);
    }

    //积攒氮气
    storgPower(dt) {
        this.node.emit(CusEvent.drift)
        //漂移
        if (this.Accelerating) {
            return
        }
        // this.powerStorage >= 100 ? 100 : 
        this.powerStorage = this.powerStorage + this.powerA * dt;// this.powerStorage < 100 ? this.powerStorage + 0.5 : 100
        this.node.emit(CusEvent.storgPower, Math.floor(this.powerStorage).toString())//发射漂移事件，正在攒气
    }
    /**
     * 使用氮气加速
     */
    emitPower() {

        if (this.powerStorage > 0) {
            this.speed = this.MaxSpeed * 1.2
            this.Accelerating = true;
            this.schedule(this.power, 0.05)
        }

    }

    zoom() {
        console.log("fd");

        this.Camera.zoomRatio += (this.MaxZoomRatio - this.Camera.zoomRatio)
        this.scheduleOnce(() => {
            this.Camera.zoomRatio += (this.MaxZoomRatio - this.Camera.zoomRatio)
        }, 1000)
    }
    power = function () {
        this.powerStorage -= this.powerA * 0.05;
        if (this.powerStorage <= 0) {
            this.unschedule(this.power);
            this.Accelerating = false
            this.speed = this.MaxSpeed
            this.powerStorage = 0;
        }

        this.node.emit(CusEvent.storgPower, Math.floor(this.powerStorage))
    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.j:
                this.keyList.set(e.keyCode, false)
                break
            case cc.macro.KEY.f: this.keyList.set(e.keyCode, false)

                break;
            case cc.macro.KEY.s: this.keyList.set(e.keyCode, false)
                break;
            case cc.macro.KEY.d: this.keyList.set(e.keyCode, false)
            case cc.macro.KEY.a: this.keyList.set(e.keyCode, false)
            default: break

        }
    }
    onKeyDown(e) {
        // console.log(this.content);

        switch (e.keyCode) {
            case cc.macro.KEY.f: this.keyList.set(e.keyCode, true)
                this.emitPower()
                break;
            case cc.macro.KEY.j: this.keyList.set(e.keyCode, true)
                break;
            case cc.macro.KEY.s: this.keyList.set(e.keyCode, true)
                this.stop = !this.stop;
                break;
            case cc.macro.KEY.d: this.keyList.set(e.keyCode, true)
                break
            case cc.macro.KEY.a: this.keyList.set(e.keyCode, true)
                break
            case cc.macro.KEY.y:
                Music.fs();
                break
            default: break
        }

    }
}
