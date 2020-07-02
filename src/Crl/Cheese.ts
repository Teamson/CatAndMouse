import Mouse from "./Mouse"
import GameLogicCrl from "./GameLogicCrl"

export default class Cheese extends Laya.Script3D {
    constructor() {
        super()
    }

    myOwner: Laya.Sprite3D = null

    gotCount: number = 0
    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
    }

    onUpdate() {
        if (GameLogicCrl.Share._MouseNode) {
            for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
                let m = GameLogicCrl.Share._MouseNode.getChildAt(i) as Laya.Sprite3D
                let mCrl = m.getComponent(Mouse) as Mouse
                if (Laya.Vector3.distance(m.transform.position.clone(), this.myOwner.transform.position.clone()) <= 1 && !mCrl.isGotCheese) {
                    mCrl.isGotCheese = true
                    this.gotCount++
                    if (this.gotCount >= GameLogicCrl.Share.countForWin) {
                        GameLogicCrl.Share.winCallback()
                    }
                    console.log('got cheese')
                }
            }
        }
    }
}