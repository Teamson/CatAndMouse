import GameLogicCrl from "../Crl/GameLogicCrl"
import PlayerDataMgr from "../Libs/PlayerDataMgr"

export default class VictoryUI extends Laya.Scene {
    constructor() {
        super()
    }

    noBounes: Laya.Sprite = this['noBounes']
    bounesNode: Laya.Sprite = this['bounesNode']

    gradeNum: Laya.FontClip = this['gradeNum']
    gradeBar: Laya.Image = this['gradeBar']
    coinNum: Laya.FontClip = this['coinNum']
    nextBtn: Laya.Image = this['nextBtn']

    gradeNum1: Laya.FontClip = this['gradeNum1']
    skinPic: Laya.Image = this['skinPic']
    getSkinBtn: Laya.Image = this['getSkinBtn']
    noBtn: Laya.Image = this['noBtn']

    onOpened() {
        this.nextBtn.on(Laya.Event.CLICK, this, this.nextBtnCB)
        this.getSkinBtn.on(Laya.Event.CLICK, this, this.getSkinBtnCB)
        this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB)
    }

    onClosed() {

    }

    nextBtnCB() {
        this.updateGrade()
        Laya.Scene.open('MyScenes/StartUI.scene')
        GameLogicCrl.Share.restartGame()
    }

    getSkinBtnCB() {

    }

    noBtnCB() {
        this.updateGrade()
        Laya.Scene.open('MyScenes/StartUI.scene')
        GameLogicCrl.Share.restartGame()
    }

    updateGrade() {
        PlayerDataMgr.getPlayerData().grade++
        if (PlayerDataMgr.getPlayerData().grade > 5) {
            PlayerDataMgr.getPlayerData().grade = 1
        }
        PlayerDataMgr.setPlayerData()
    }
}