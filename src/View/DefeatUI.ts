import GameLogicCrl from "../Crl/GameLogicCrl"

export default class DefeatUI extends Laya.Scene {
    constructor() {
        super()
    }

    gradeNum: Laya.FontClip = this['gradeNum']
    gradeBar: Laya.Image = this['gradeBar']
    tipsBtn: Laya.Image = this['tipsBtn']
    noBtn: Laya.Image = this['noBtn']

    onOpened() {
        this.tipsBtn.on(Laya.Event.CLICK, this, this.tipsBtnCB)
        this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB)
    }

    onClosed() {

    }

    tipsBtnCB() {

    }

    noBtnCB() {
        Laya.Scene.open('MyScenes/StartUI.scene')
        GameLogicCrl.Share.restartGame()
    }
}