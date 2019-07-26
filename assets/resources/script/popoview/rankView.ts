import Item from "./item/item";

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
export default class rankView extends cc.Component {

    @property(cc.Prefab)
    private item: cc.Prefab = null;

    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = null
    private items: cc.NodePool = new cc.NodePool();

    onLoad() {
        let url: string = "https://wx.qlogo.cn/mmopen/vi_32/KJswTPhl1eIn9sxyianELR3f8N55T1REP8qZdh2ZniaTricD8FeWsY7YOZfzkPXzMva0ZFpyg863FlWED3MF3SBTg/132";
        cc.loader.load({ url: url + "?a.png", type: 'png' }, function (err, texture) {
            const centent = this.scrollView.content;
            const item: cc.Node = cc.instantiate(this.item);
            item.getComponent(Item).init(texture);
            centent.addChild(item)

        }.bind(this))

    }
    start() {
        let apply = this.node.getChildByName("tips").getChildByName("apply");
        // console.log(apply);
        // this.node.parent.removeChild(this.node)

        apply.on(cc.Node.EventType.TOUCH_START, function () {
            // console.log("add");
            this.node.active = false
        }.bind(this))
    }

    // update (dt) {}
}
