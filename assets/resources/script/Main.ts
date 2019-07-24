import Player from "./Player";
import { Music } from "./Music";
import { CusEvent } from "./entity/CusEvent";
const { ccclass, property } = cc._decorator;
/**
 * 控制页面的ui
 */
@ccclass
export default class Main extends cc.Component {


    @property(cc.Node)
    private player: cc.Node = null
    @property(cc.Node)
    private drift: cc.Node = null
    @property(cc.Node)
    private speedUp: cc.Node = null

    /**
     * 氮气
     */
    @property(cc.Label)
    private power: cc.Label = null
    /**
     * 计时
     */
    @property(cc.Label)
    private timer: cc.Label = null
    /**
     * 开始
     */
    @property(cc.Label)
    private startLabel: cc.Label = null
    /**
     * 速度
     */
    @property(cc.Label)
    private speed: cc.Label = null
    @property(cc.Node)
    private Map: cc.Node = null
    /**
     * 前面的节点
     */
    @property({
        type: cc.Prefab

    })
    private frontNode: cc.Prefab = null;
    @property(cc.Node)
    private road: cc.Node = null;
    /**
     * 对象池
     */
    public Nodes: cc.NodePool = new cc.NodePool();;
    /**
     * 音频缓存
     */
    public static Music = new Map();
    public static musicSwitch: boolean = true
    public static PlayMusic = new Map();
    time: number = 0;
    bgm: number
    musicLoad: boolean = false
    PlayerScrpit: Player
    Countdown: number = 3;

    n

    // content = new AudioContext();
    onLoad() {
        Music.init(function () {
            // Music.RandomPlayBGM(false);
            this.musicLoad = true
        }.bind(this))
        this.n = cc.instantiate(this.frontNode);
        
        this.Map.addChild(this.n);
    }
    start() {
        // console.log(this.frontNode);
        
        this.PlayerScrpit = this.player.getComponent("Player");
        this.startLabel.string = "游戏倒计时"
        this.timer.string = "0"
        this.power.string = "0"
        this.speed.string = "0"
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, function (e) {
            console.log(this);
        }, this)
        // const test = cc.instantiate(this.frontNode);
        // this.road.addChild(test)
        // this.linkNode(this.road, test, 60, 0)
        // console.log(this.road);

        /**
         * 漂移，加速
         */
        // this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
        //     // this.content.resume();
        // }.bind(this))
        if (this.drift && this.speedUp) {

            this.drift.on(cc.Node.EventType.TOUCH_START, function (e) {
                this.PlayerScrpit.touch_start(2)
            }, this)
            this.drift.on(cc.Node.EventType.TOUCH_END, function (e) {
                this.PlayerScrpit.touch_start(3)
            }, this)
            this.speedUp.on(cc.Node.EventType.TOUCH_START, function (e) {
                this.PlayerScrpit.touch_start(1)
            }, this)
            this.speedUp.on(cc.Node.EventType.TOUCH_END, function (e) {
                this.PlayerScrpit.touch_start(0)
            }, this)
        }
        this.onPlayer();


    }
    onPlayer() {
        // this.Nodes.get()
        this.schedule(this.strCall, 1)
        this.player.on(CusEvent.storgPower, function (power: string) {
            this.power.string = power;
        }, this)
        this.player.on(CusEvent.emit_speed, function (v: number) {
            this.speed.string = Math.floor(v).toString()
        }, this);
        /**
         * outNode：需要回收的节点
         * nowNode：现在所处的节点
         */
        this.player.on(CusEvent.outNode, function (outNode, nowNode) {
            // this.linkNode(this.frontNode, outNode, 0, 0)
        }, this)
    }
    update(dt) {
        // console.log(this.player.x / 45, this.player.y / 45);
        this.n.setPosition(this.player.x / 45, this.player.y / 45)
        if (this.Countdown < 0) {
            this.time += dt
            const m = Math.floor(this.time / (60));
            const s = Math.floor(this.time - (m * 60));
            const ms = Math.floor((this.time - m * 60 - s) * 10000)
            this.timer.string = m + ":" + s + ":" + ms;
        }
    }

    strCall = function () {
        if (this.Countdown === 0) {
            // this.stop = false;
            // this.GameStart = true
            this.player.emit("gameStart")//开始游戏

            this.startLabel.node.destroy();
            // 取消这个计时器
            this.unschedule(this.strCall);
            this.Countdown = -1;
            return
        } else if (this.Countdown === 3) {
            Music.playEffectMusic(Music.MapMusics.preparation, false);

        }
        this.startLabel.string = this.Countdown
        this.Countdown--;
    }
    /**
     * 
     * @param n1 参考物
     * @param n2 添加节点
     * @param ro 角度
     * @param dir 方位
     */
    linkNode(n1: cc.Node, n2: cc.Node, ro: number, dir: number) {
        n2.rotation = ro;
        // console.log(n1);

        /**
         * 上下左右
         */
        switch (dir) {
            case 0:
                n2.y = n1.y + n2.height
                n2.x = n1.x;
                break
            case 1:
                break
            case 2:
                break
            case 3:
                break
            default:
                break
        }
    }
}
