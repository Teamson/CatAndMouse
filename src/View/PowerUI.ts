import PlayerDataMgr from "../Libs/PlayerDataMgr"
import ShareMgr from "../Mod/ShareMgr"

export default class PowerUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    getPowerBtn: Laya.Image = this['getPowerBtn']

    onOpened() {
        this.getPowerBtn.on(Laya.Event.CLICK, this, this.getPowerBtnCB)
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)

    }

    onClosed() {

    }

    getPowerBtnCB() {
        let cb = () => {
            PlayerDataMgr.getPower(5)
            this.closeBtnCB()
        }
        ShareMgr.instance.shareGame(cb)
    }

    closeBtnCB() {
        this.close()
    }
}