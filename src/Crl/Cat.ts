import GameLogicCrl from "./GameLogicCrl"
import Capsule from "./Capsule"
import Mouse from "./Mouse"
import { PropName } from "../Libs/Entity"
import AStar from "../Libs/AStar"

export default class Cat extends Laya.Script3D {
    constructor() {
        super()
    }

    myOwner: Laya.Sprite3D = null
    _ani: Laya.Animator = null
    _body: Laya.Rigidbody3D = null

    targetNode: Laya.Sprite3D = null

    isHurt: boolean = false
    speed: number = 0.06;

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
        this._ani = this.myOwner.getComponent(Laya.Animator) as Laya.Animator
        this._body = this.myOwner.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D
        this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
    }

    playAniByName(name: string) {
        this._ani.play(name)
    }

    closestMouse(arr: Laya.Sprite3D[]) {
        if (arr.length <= 0) {
            return null
        }

        arr.sort((a, b) => {
            return Laya.Vector3.distance(this.myOwner.transform.position.clone(), a.transform.position.clone()) -
                Laya.Vector3.distance(this.myOwner.transform.position.clone(), b.transform.position.clone())
        })
        return arr[0]
    }

    checkCanCatchMouse() {
        let cArr: any[] = []
        let lMin: number = 999
        for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
            let m = GameLogicCrl.Share._MouseNode.getChildAt(i) as Laya.Sprite3D
            let mCrl = m.getComponent(Mouse) as Mouse
            if (mCrl.starId == -1) {
                continue
            }
            let cId = AStar.getMyStarId(this.myOwner.transform.position.clone())
            let arr = AStar.readyToCal(cId, mCrl.starId)
            if (arr.length <= 0) continue

            if (arr.length <= lMin) {
                cArr = arr
                lMin = arr.length
            }
        }
        if (cArr.length > 0) {
            return cArr
        } else {
            return []
        }
    }

    onUpdate() {
        if (GameLogicCrl.Share.isOver || this.targetNode) return
        let arr = this.checkCanCatchMouse()
        if (arr.length > 1) {
            this.targetNode = arr[1]
        }
    }

    onLateUpdate() {
        if (!this.isHurt) {
            for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
                let m = GameLogicCrl.Share._MouseNode.getChildAt(i) as Laya.Sprite3D
                if (Laya.Vector3.distance(this.myOwner.transform.position.clone(), m.transform.position.clone()) <= 1) {
                    GameLogicCrl.Share.mouseIsCaught(m)
                }
            }
        }

        if (this.targetNode && !this.isHurt && !GameLogicCrl.Share.isOver) {
            this.myOwner.transform.lookAt(this.targetNode.transform.position.clone(), new Laya.Vector3(0, 1, 0))
            this.myOwner.transform.localRotationEulerY += 180

            let dir: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(this.targetNode.transform.position.clone(), this.myOwner.transform.position.clone(), dir);
            Laya.Vector3.normalize(dir, dir);
            dir = new Laya.Vector3(dir.x * this.speed, dir.y * this.speed, dir.z * this.speed);
            let pos = new Laya.Vector3(0, 0, 0)
            Laya.Vector3.add(this.myOwner.transform.position.clone(), dir, pos)
            this.myOwner.transform.position = pos.clone()
            if (this._ani.getCurrentAnimatorPlayState().animatorState.name != 'walk') {
                this.playAniByName('walk')
            }

            let dis = Laya.Vector3.distance(this.myOwner.transform.position.clone(), this.targetNode.transform.position.clone());
            if (dis <= 0.2) {
                this.targetNode = null
            }
        } else {
            if (this._ani.getCurrentAnimatorPlayState().animatorState.name == 'walk') {
                this.playAniByName('idle')
            }
            this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
        }
    }

    onCollisionEnter(collision: laya.d3.physics.Collision) {
        // let node = collision.other.owner as Laya.Sprite3D
        // if (node.parent && node.parent.name == 'PropNode') {
        //     this.checkIsProp(node)
        // }
    }

    checkIsProp(prop: Laya.Sprite3D) {
        switch (prop.name) {
            case PropName.PROP_CLIP:
                this.triggerClip(prop)
                break
        }
    }

    triggerClip(prop: Laya.Sprite3D) {
        prop.removeSelf()
        this.isHurt = true
        this.playAniByName('hurt')
        this._body.isTrigger = true
    }
}