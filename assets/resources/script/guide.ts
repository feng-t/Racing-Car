import { HttpUtils } from "./HttpUtils";

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
        // const s = HttpUtils.formatParams({
        //     cocos: "ss",
        //     dd: "test"
        // });


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
                                        console.log(res);
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
            // this.wx.getUserInfo({
            //     success: function (urs) {
            //         that.wx.login({
            //             success(res) {
            //                 if (res.code) {
            //                     that.wx.request({
            //                         url: "http://localhost:8080/user/login",
            //                         method: "POST",
            //                         // header:{
            //                         //     'Content-Type': 'application/json'
            //                         // },
            //                         data: {
            //                             code: res.code,
            //                             userInfo: urs.userInfo
            //                         },
            //                         success(rs) {
            //                             // console.log(rs);
            //                             if (rs && rs.flag) {
            //                                 cc.director.loadScene("Home")
            //                             }
            //                         }
            //                     })
            //                 } else {
            //                     console.log("登陆失败", res.errMsg);

            //                 }
            //             }
            //         })
            //     }
            // })

        }

    }
}
