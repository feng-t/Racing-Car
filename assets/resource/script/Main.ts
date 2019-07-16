import Player from "./Player";

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

    PlayerScrpit: Player

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
    time: number = 0;
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
    Countdown: number = 3;

    onLoad() {

    }

    start() {
        this.PlayerScrpit = this.player.getComponent("Player");
        this.startLabel.string = "游戏倒计时"
        this.timer.string = "0"
        this.power.string = "0"
        this.speed.string = "0"
        /**
         * 漂移，加速
         */
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
        this.schedule(this.strCall, 1)
        this.player.on("storgPower", function (power: string) {
            this.power.string = power;
        }, this)
        this.player.on("speed", function (v: number) {
            this.speed.string = Math.floor(v).toString()
        }, this);
    }
    update(dt) {
        if (this.Countdown < 0) {
            this.time += dt
            const m = Math.floor(this.time / (60));
            const s = Math.floor(this.time - (m * 60));
            const ms = Math.floor((this.time - m * 60 - s) * 100)
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
        }
        this.startLabel.string = this.Countdown
        this.Countdown--;
    }
}
