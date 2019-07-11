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

@ccclass
export default class Main extends cc.Component {

    @property(cc.Node)
    player: cc.Node
    @property(cc.Node)
    drift: cc.Node
    @property(cc.Node)
    speedUp: cc.Node
    PlayerScrpit: Player
    
    onLoad() {

    }

    start() {
        this.PlayerScrpit = this.player.getComponent("Player");
        
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
    }

    update(dt) { }
}
