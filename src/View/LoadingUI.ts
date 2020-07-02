import WxApi from "../Libs/WxApi";
import GameLogicCrl from "../Crl/GameLogicCrl";

export default class LoadingUI extends Laya.Scene {
    constructor() {
        super()
    }

    bar: Laya.Image = this['bar']
    cheese: Laya.Image = this['cheese']
    perNum: Laya.FontClip = this['perNum']

    onOpened() {
        if (Laya.Browser.onWeiXin) {
            this.loadSubpackage()
        } else {
            this.loadRes()
        }
    }

    onClosed() {

    }

    loadSubpackage() {
        const loadTask = Laya.Browser.window.wx.loadSubpackage({
            name: 'unity', // name 可以填 name 或者 root
            success: (res) => {
                // 分包加载成功后通过 success 回调
                this.loadRes()
            },
            fail: (res) => {
                // 分包加载失败通过 fail 回调
                this.loadSubpackage()
            }
        })

        loadTask.onProgressUpdate(res => {
            console.log('下载进度', res.progress)
            console.log('已经下载的数据长度', res.totalBytesWritten)
            console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)

            this.perNum.value = Math.floor(res.progress / 2) + '%'
            this.bar.width = 300 * (res.progress / 50)
            this.cheese.x = 75 + this.bar.width
        })
    }

    loadRes() {
        //预加载3d资源
        var resUrl = [
            WxApi.UnityPath + 'Scene1.lh',
            WxApi.UnityPath + 'Scene2.lh',
            WxApi.UnityPath + 'Scene3.lh',
            WxApi.UnityPath + 'Scene4.lh',
            WxApi.UnityPath + 'Scene5.lh'
        ];
        Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
    }

    onComplete() {
        Laya.Scene.open('MyScenes/StartUI.scene')
        GameLogicCrl.Share.initScene()
    }

    onProgress(value) {
        this.bar.width = 300 + 300 * value
        this.perNum.value = (50 + Math.floor(value * 50)).toString() + '%'
        this.cheese.x = 75 + this.bar.width
    }
}