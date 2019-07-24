// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export class Music {
    public static MapMusics = {
        BGM4: "游戏BGM04",
        BGM5: "游戏BGM05",
        BGM6: "游戏BGM06",
        preparation: "发车前预备3秒",
        driving: "行驶过程",
        drifting: "漂移中",
        startdrift: "漂移开始",
        enddrift: "漂移结束",
    }
    /**
     * 操作
     */
    public static Operating = {
        /**
         * 暂停
         */
        pause: "pause",
        /**
         * 停止
         */
        stop: "stop",
        /**
         * 恢复
         */
        resume: "resume",


    }

    public static Name = [Music.MapMusics.BGM4, Music.MapMusics.BGM5, Music.MapMusics.BGM6];
    /**
     * 音频缓存
     */
    public static Musics = new Map();
    /**
     * 存放音频id
     */
    public static PlayMusics = new Map();

    public static load: boolean = false
    /**
     * 音乐开关
     */
    private static flag: boolean = true
    public static bgm: number;

    public static fs() {
        this.musicSwitch(!this.flag)
    }
    public static musicSwitch(flag: boolean) {
        if (flag) {
            cc.audioEngine.resumeAll();
        } else {
            cc.audioEngine.pauseAll();
        }
        this.flag = flag;
    }

    public static init(call: Function) {

        cc.loader.loadResDir("/muics", cc.AudioClip, function (err, clips: cc.AudioClip[], urls) {
            if (err) {
                return
            } else {
                clips.forEach(function (v: cc.AudioClip, index, []) {
                    Music.Musics.set(v.name, v)
                });
            }
            this.load = true
            call();

        }.bind(this))
    }
    /**
     * 播放背景音乐
     * @param flag 
     */
    public static RandomPlayBGM(loop: boolean) {
        if (!this.load) {
            return
        }
        if (this.flag) {
            this.bgm = Math.floor(Math.random() * Math.floor(Music.Name.length));
            Music.PlayMusics.set(
                Music.Name[this.bgm]
                , cc.audioEngine.playMusic(Music.Musics.get(Music.Name[this.bgm]), false)
            )
        } else {
            return
            // cc.audioEngine.stopAll()
        }
        if (loop) {
            let m = Music.PlayMusics.get((Music.Name[this.bgm]))
            cc.audioEngine.setFinishCallback(m, function () {
                if (this.flag) {
                    Music.RandomPlayBGM(true);
                }
            }.bind(this))
        }
    }
    public static stopAll() {
        this.flag = false;
        cc.audioEngine.stopAll();
    }
    public static getAudioID(str: string): number {
        return Music.PlayMusics.get(str);
    }
    /**
     * 播放音乐
     * @param audioID 
     * @param Oper 
     */
    public static Music(audioID: number, Oper: string) {
        switch (Oper) {
            case Music.Operating.pause:
                cc.audioEngine.pause(audioID)
                break
            case Music.Operating.resume:
                cc.audioEngine.resume(audioID)
                break
            case Music.Operating.stop:
                cc.audioEngine.stop(audioID)
                break

            default: break
        }

    }
    public static playEffectMusic(str: string, loop: boolean) {
        if (!this.flag) {
            return
        }
        cc.audioEngine.stopAllEffects();
        let m = 0;
        if (m = Music.PlayMusics.get(str)) {
            if (loop) {
                Music.PlayMusics.set(str, cc.audioEngine.playEffect(Music.Musics.get(str), loop))
            } else {
                cc.audioEngine.resume(m)
            }
        } else {
            if (Music.Musics.get(str)) {
                Music.PlayMusics.set(str, cc.audioEngine.playEffect(Music.Musics.get(str), loop))
            } else {
                cc.loader.loadRes("/muics/" + str, cc.AudioClip, function (err, clip) {
                    if (err) {
                        console.error(err);
                        return
                    } else {
                        const m = cc.audioEngine.playEffect(clip, loop);
                        Music.PlayMusics.set(str, m)
                        Music.Musics.set(str, clip);
                    }
                })
            }

        }
    }
}
