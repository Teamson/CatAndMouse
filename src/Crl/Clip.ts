import GameLogicCrl from "./GameLogicCrl"
import Cat from "./Cat"
import Mouse from "./Mouse"

export default class Clip extends Laya.Script3D {
    constructor() {
        super()
    }

    myOwner: Laya.Sprite3D = null

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
    }

    onUpdate() {
        if (GameLogicCrl.Share._Cat) {
            if (Laya.Vector3.distance(GameLogicCrl.Share._Cat.transform.position.clone(), this.myOwner.transform.position.clone()) <= 0.8) {
                let cCrl = GameLogicCrl.Share._Cat.getComponent(Cat) as Cat
                cCrl.triggerClip(this.myOwner)
            }
        }
        for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
            let mouse = GameLogicCrl.Share._MouseNode.getChildAt(i) as Laya.Sprite3D
            let mCrl = mouse.getComponent(Mouse) as Mouse
            if (Laya.Vector3.distance(mouse.transform.position.clone(), this.myOwner.transform.position.clone()) <= 0.5) {
                mCrl.triggerClip(this.myOwner)
            }
        }
    }
}