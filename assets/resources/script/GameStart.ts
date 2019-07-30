import { GameData } from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStart extends cc.Component {

    @property(cc.Node)
    roadNode: cc.Node = null;

    @property(cc.Button)
    btn: cc.Button = null;

    @property(cc.Node)
    rankBtn: cc.Node = null;
    @property(cc.Prefab)
    rank: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:
    @property([cc.Prefab])
    private road: cc.Prefab[] = [];
    private leftNode: cc.Node;
    private rightNode: cc.Node;
    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;
        this.loadNode();
    }

    start() {

        this.leftNode.on(cc.Node.EventType.TOUCH_START, function (e) {
            console.log("left");
        }.bind(this))
        this.rightNode.on(cc.Node.EventType.TOUCH_START, function (e) {
            console.log("left");
        }.bind(this))
        // this.node.addChild(cc.instantiate(this.rank))

    }

    loadNode() {
        GameData.getInstance().road = cc.instantiate(this.road[0]);
        // this.node.addChild(GameData.getInstance().road)
        cc.director.preloadScene("open1", (c: number, t: number, i: any) => {
            //load

        }, (error: Error, asset: cc.SceneAsset) => {
            if (error) {
                console.error(error);
                return
            }
            this.btn.node.on("click", function () {

                cc.director.loadScene("open1")
            }, this)

            this.rankBtn.on(cc.Node.EventType.TOUCH_START, function (e) {
                let n: cc.Node
                if (n = this.node.getChildByName("bot")) {
                    n.active = true;
                    return
                }
                n = cc.instantiate(this.rank);
                this.node.addChild(n)
            }.bind(this))
        })
        this.leftNode = this.roadNode.getChildByName("left")
        this.rightNode = this.roadNode.getChildByName("right")

    }
    // update (dt) {}
}
