import PlayerDataMgr from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"
import TimeCountMgr from "../Libs/TimeCountMgr"

export default class StartUI extends Laya.Scene {
    constructor() {
        super()
    }

    powerNum: Laya.FontClip = this['powerNum']
    coinNum: Laya.FontClip = this['coinNum']
    gradeNum: Laya.FontClip = this['gradeNum']
    gradeBar: Laya.Image = this['gradeBar']
    powerTime: Laya.Label = this['powerTime']

    startBtn: Laya.Image = this['startBtn']
    signBtn: Laya.Image = this['signBtn']
    skinBtn: Laya.Image = this['skinBtn']

    onOpened(param?: any) {
        this.startBtn.on(Laya.Event.CLICK, this, this.startBtnCB)
        this.signBtn.on(Laya.Event.CLICK, this, this.signBtnCB)
        this.skinBtn.on(Laya.Event.CLICK, this, this.skinBtnCB)

        this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString()

        Laya.timer.frameLoop(1, this, this.updateCB)
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    startBtnCB() {
        if (PlayerDataMgr.getPlayerData().power <= 0) {
            Laya.Scene.open('MyScenes/PowerUI.scene', false)
            return
        }
        PlayerDataMgr.decPower()
        Laya.Scene.open('MyScenes/GameUI.scene')
    }

    signBtnCB() {

    }

    skinBtnCB() {
        Laya.Scene.open('MyScenes/SkinUI.scene')
    }

    updateCB() {
        this.calculatePowerTime()
        this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString()
    }

    calculatePowerTime() {
        let t = TimeCountMgr.Share.tCount
        let m = Math.floor(t / 60)
        let s = Math.floor(t - m * 60)
        this.powerTime.text = m.toString() + ':' + s.toString()
        this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString()
        this.powerTime.visible = PlayerDataMgr.getPlayerData().power < PlayerDataMgr.powerMax
    }
}