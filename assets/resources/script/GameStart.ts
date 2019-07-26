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
export default class GameStart extends cc.Component {

    @property(cc.Button)
    btn: cc.Button = null;

    @property(cc.Node)
    rankBtn: cc.Node = null;
    @property(cc.Prefab)
    rank: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {

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
                let n:cc.Node
                if(n=this.node.getChildByName("bot")){
                    n.active=true;
                    return
                }
                n = cc.instantiate(this.rank);
                this.node.addChild(n)
            }.bind(this))
            
        })
        // this.node.addChild(cc.instantiate(this.rank))
        
    }

    // update (dt) {}
}
