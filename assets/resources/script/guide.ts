import { HttpUtils } from "./HttpUtils";
import { GameData } from "./GameData";

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
export default class NewClass extends cc.Component {
    private wx;
    onLoad() {
        this.wx = window["wx"]
        console.log("load");

    }

    start() {

    }

    update(dt) { }

    onclick() {
        
        

        if (this.wx) {
            let that = this;



            that.wx.getUserInfo({
                success(ures) {
                    that.wx.login({
                        success(lres) {
                            if (lres.code) {
                                HttpUtils.Request({
                                    url: "http://localhost:8080/user/login",
                                    type: "post",
                                    data: {
                                        code: lres.code,
                                        userInfo: ures.userInfo
                                    },
                                    success: function (res) {
                                        res = res.data;
                                        if (res && res.flag) {
                                            cc.director.loadScene("Home")
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })

          

        }

    }
}
