import PlayerDataMgr from "../Libs/PlayerDataMgr"

export default class SkinUI extends Laya.Scene {
    constructor() {
        super()
    }

    topBg: Laya.Image = this['topBg']
    bgPic: Laya.Image = this['bgPic']
    backBtn: Laya.Image = this['backBtn']
    skinPic: Laya.Image = this['skinPic']
    coinNum: Laya.FontClip = this['coinNum']
    skinNode: Laya.Sprite = this['skinNode']
    unlockBtn: Laya.Image = this['unlockBtn']
    unlockNum: Laya.FontClip = this['unlockNum']

    chosenId: number = -1

    onOpened() {
        Laya.timer.frameLoop(1, this, this.undateCB)
        this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB)
        this.unlockBtn.on(Laya.Event.CLICK, this, this.unlockBtnCB)

        this.skinPic.skin = 'pfsy/pfsy_pf/m_' + (PlayerDataMgr.getPlayerData().playerId + 1) + '.png'
        this.topBg.y = this.bgPic.y - this.topBg.height
        this.initItems()
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    initItems() {
        for (let i = 0; i < this.skinNode.numChildren; i++) {
            let item = this.skinNode.getChildAt(i) as Laya.Image
            let bg = item.getChildByName('bg') as Laya.Image
            let pic = item.getChildByName('pic') as Laya.Image
            let tick = item.getChildByName('tick') as Laya.Image

            tick.visible = false
            if (PlayerDataMgr.getPlayerData().playerId == i) {
                //已上阵
                bg.skin = 'pfk/pfk_ysz.png'
                tick.visible = true
            } else if (PlayerDataMgr.getPlayerData().playerArr[i] == 1) {
                //已解锁
                bg.skin = 'pfk/pfk_yjs.png'
            } else if (PlayerDataMgr.getPlayerData().playerArr[i] == 0) {
                //未解锁
                if (i == this.chosenId) {
                    //选择解锁
                    bg.skin = 'pfk/pfk_xzjs.png'
                } else {
                    bg.skin = 'pfk/pfk_wjs.png'
                }
            }

            pic.skin = 'pfsy/pfsy_pf/m_' + (i + 1) + '.png'
            pic.visible = PlayerDataMgr.getPlayerData().playerArr[i] == 1

            item.off(Laya.Event.CLICK, this, this.itemCB)
            item.on(Laya.Event.CLICK, this, this.itemCB, [i])
        }
    }

    itemCB(id: number) {
        this.chosenId = -1
        if (PlayerDataMgr.getPlayerData().playerId == id) return

        if (PlayerDataMgr.getPlayerData().playerArr[id] == 1) {
            //点击已解锁item
            PlayerDataMgr.getPlayerData().playerId = id
        } else if (PlayerDataMgr.getPlayerData().playerArr[id] == 0) {
            //点击未解锁item
            this.chosenId = id
        }
        this.initItems()
    }

    undateCB() {
        this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString()
    }

    unlockBtnCB() {

    }

    backBtnCB() {
        Laya.Scene.open('MyScenes/StartUI.scene')
    }
}