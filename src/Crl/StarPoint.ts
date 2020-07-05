import GameLogicCrl from "./GameLogicCrl"
import AStar from "../Libs/AStar"

export default class StarPoint extends Laya.Script {
    constructor() {
        super()
    }
    myOwner: Laya.Sprite3D = null
    myBox: Laya.BoundBox = null

    arrIndex: Laya.Vector2 = new Laya.Vector2(0, 0)
    myId: number = 0
    aStarF: number = 0
    aStarG: number = 0
    aStarH: number = 0
    isColl: boolean = false

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
        this.myId = this.myOwner.parent.getChildIndex(this.myOwner)
        this.arrIndex.x = Math.floor(this.myId % 9)
        this.arrIndex.y = Math.floor(this.myId / 9)

        this.checkIsColl()
    }

    checkIsColl() {
        for (let i = 0; i < GameLogicCrl.Share.collPoints.length; i++) {
            let c = GameLogicCrl.Share.collPoints[i] as Laya.Sprite3D
            let cPos = new Laya.Vector2(c.transform.position.clone().x, c.transform.position.clone().z)
            let mPos = new Laya.Vector2(this.myOwner.transform.position.clone().x, this.myOwner.transform.position.clone().z)

            if (mPos.x <= cPos.x + AStar.gridWidth / 2 && mPos.x >= cPos.x - AStar.gridWidth / 2 &&
                mPos.y <= cPos.y + AStar.gridWidth / 2 && mPos.y >= cPos.y - AStar.gridWidth / 2) {
                this.isColl = true
                return
            }
        }
        this.isColl = false
    }

    onUpdate() {
        
    }
}