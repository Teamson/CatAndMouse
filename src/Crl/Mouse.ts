import GameLogicCrl from "./GameLogicCrl"
import Utility from "../Mod/Utility"
import Capsule from "./Capsule"
import { PropName } from "../Libs/Entity";

export default class Mouse extends Laya.Script3D {
    constructor() {
        super()
    }

    myOwner: Laya.Sprite3D = null;
    _body: Laya.Rigidbody3D = null;
    _ani: Laya.Animator = null
    targetNode: Laya.Sprite3D = null;
    tempTargetNode: Laya.Sprite3D = null
    pointTarget: Laya.Sprite3D = null;
    isToPoint: boolean = false;
    isGotDes: boolean = false
    isGotCheese: boolean = false;

    isHurt: boolean = false

    curId: number = 0;
    speed: number = 0.02;

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D;
        this._ani = this.myOwner.getComponent(Laya.Animator) as Laya.Animator
        this.playAniByName('idle')
        this._body = this.myOwner.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
        this.tempTargetNode = GameLogicCrl.Share.currentPointsNode.getChildAt(0) as Laya.Sprite3D;
    }

    playAniByName(name: string) {
        this._ani.play(name)
    }

    getValidPos(): number[] {
        let posArr: number[] = [];
        for (let i = 0; i < GameLogicCrl.Share.currentCollNode.numChildren; i++) {
            let coll = GameLogicCrl.Share.currentCollNode.getChildAt(i) as Laya.Sprite3D;
            let cCrl = coll.getComponent(Capsule) as Capsule;
            if (cCrl.isOpen) {
                posArr.push(i)
            }
        }
        return posArr;
    }

    getValidPoint() {

    }

    onUpdate() {
        //if (GameLogicCrl.Share.isOver) return

        if(this.isGotCheese){
            this.targetNode = GameLogicCrl.Share.propNode.getChildByName('DesDoor') as Laya.Sprite3D
            return
        }

        if (this.curId == GameLogicCrl.Share.cheeseId) {
            this.targetNode = GameLogicCrl.Share.propNode.getChildByName('Cheese') as Laya.Sprite3D
            return
        }

        let posArr = this.getValidPos();
        if (posArr.length > 0) {
            if (posArr.indexOf(this.curId) != -1) {
                this.targetNode = GameLogicCrl.Share.currentPosNode.getChildAt(this.curId) as Laya.Sprite3D;
            } else {
                this.targetNode = null;
            }
        } else {
            this.targetNode = null;
        }

        if (this.targetNode == null) {
            this.targetNode = GameLogicCrl.Share.currentPointsNode.getChildAt(this.curId) as Laya.Sprite3D;
        }
    }

    onLateUpdate() {
        if (this.targetNode != null && this.tempTargetNode != this.targetNode && !this.isHurt && !GameLogicCrl.Share.isDefeat) {
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
            if (dis <= 0.4) {
                if (this.targetNode.parent.name == 'PosNode') {
                    this.curId += 1
                } else if (this.curId >= GameLogicCrl.Share.currentPosNode.numChildren) {
                    this.curId += 1
                }
                this.tempTargetNode = this.targetNode
            }
        } else {
            if (this._ani.getCurrentAnimatorPlayState().animatorState.name == 'walk') {
                this.playAniByName('idle')
            }
            this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
        }
    }

    onTriggerEnter(other: laya.d3.physics.PhysicsComponent) {
    }

    onCollisionEnter(collision: laya.d3.physics.Collision) {
        let node = collision.other.owner as Laya.Sprite3D
        if (node.name.search('Mouse') != -1) return
        this.checkIsProp(node)
    }

    checkIsProp(prop: Laya.Sprite3D) {
        switch (prop.name) {
            case PropName.PROP_CLIP:
                //this.triggerClip(prop)
                break
            case PropName.PROP_INDOOR:
                this.triggerInDoor()
                break
            case PropName.PROP_PEPPER:
                this.triggerPepper()
                break
            case PropName.PROP_FIRE:
                this.triggerFire()
                break
            case PropName.PROP_COIN:
                this.triggerCoin()
                break
            case PropName.PROP_CHEESE:
                break
            case PropName.PROP_DESDOOR:
                this.myOwner.destroy()
                console.log('des door')
                break
        }
    }

    triggerClip(prop: Laya.Sprite3D) {
        prop.removeSelf()
        this.isHurt = true
        this.playAniByName('hurt')
        this._body.isTrigger = true
    }

    triggerInDoor() {
        let outDoor: Laya.Sprite3D = GameLogicCrl.Share.getPropByName(PropName.PROP_OUTDOOR)
        let desId: number = parseInt(outDoor.getChildAt(0).name)
        let pos = outDoor.transform.position.clone()
        this.myOwner.transform.position = pos
        this.curId = desId - 1
        this.tempTargetNode = null
    }

    triggerPepper() {

    }

    triggerFire() {

    }

    triggerCoin() {

    }
}