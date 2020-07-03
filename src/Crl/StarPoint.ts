import GameLogicCrl from "./GameLogicCrl"

export default class StarPoint extends Laya.Script {
    constructor() {
        super()
    }
    myOwner: Laya.Sprite3D = null
    myBox: Laya.BoundBox = null

    isColl: boolean = false

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D

        // let coll: Laya.PhysicsCollider = this.myOwner.getComponent(Laya.PhysicsCollider)
        // let shape: Laya.BoxColliderShape = coll.colliderShape as Laya.BoxColliderShape
        // let sNodePos: Laya.Vector3 = this.myOwner.transform.position.clone()
        // sNodePos.x += shape.localOffset.x
        // sNodePos.y += shape.localOffset.y
        // sNodePos.z += shape.localOffset.z
        // let min: Laya.Vector3 = new Laya.Vector3(sNodePos.x - shape.sizeX / 2, sNodePos.y - shape.sizeY / 2, sNodePos.z - shape.sizeZ / 2)
        // let max: Laya.Vector3 = new Laya.Vector3(sNodePos.x + shape.sizeX / 2, sNodePos.y + shape.sizeY / 2, sNodePos.z + shape.sizeZ / 2)
        // let bb = new Laya.BoundBox(min, max)
        // this.myBox = bb
    }

    checkIsContainPoint(p: Laya.Vector3) {
        // if (Laya.CollisionUtils.boxContainsPoint(this.myBox, p)) {
        //     return true
        // } else {
        //     return false
        // }
        if (Laya.Vector3.distance(this.myOwner.transform.position.clone(), p) < 1) {
            return true
        } else {
            return false
        }
    }

    onUpdate() {
        for (let i = 0; i < GameLogicCrl.Share.collPoints.length; i++) {
            let c = GameLogicCrl.Share.collPoints[i] as Laya.Sprite3D
            if (this.checkIsContainPoint(c.transform.position.clone())) {
                this.isColl = true
                console.log(this.owner.name)
                return
            }
        }
        this.isColl = false
    }
}