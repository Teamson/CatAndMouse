import GameLogicCrl from "./GameLogicCrl"
import Capsule from "./Capsule"
import Mouse from "./Mouse"
import { PropName } from "../Libs/Entity"

export default class Cat extends Laya.Script3D {
    constructor() {
        super()
    }

    myOwner: Laya.Sprite3D = null
    _ani: Laya.Animator = null
    _body: Laya.Rigidbody3D = null

    targetNode: Laya.Sprite3D = null
    tempTargetNode: Laya.Sprite3D = null

    prePosArr: number[] = []

    isHurt: boolean = false

    isCatchMouse: boolean = false
    isStayPoint: boolean = true
    isIncreaseId: boolean = false
    curId: number = 3
    speed: number = 0.04;

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
        this.curId = parseInt(this.myOwner.getChildAt(0).name)
        this._ani = this.myOwner.getComponent(Laya.Animator) as Laya.Animator
        this._body = this.myOwner.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D
        this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
        this.targetNode = GameLogicCrl.Share.currentPointsNode.getChildAt(this.curId) as Laya.Sprite3D
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

    checkCanCatchMouse(): Laya.Sprite3D[] {
        let caughtMouseArr: Laya.Sprite3D[] = []
        let catId: number = this.curId
        for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
            let mouse: Laya.Sprite3D = GameLogicCrl.Share._MouseNode.getChildAt(i) as Laya.Sprite3D
            let mCrl: Mouse = mouse.getComponent(Mouse)
            let mouseId: number = mCrl.curId

            if (catId == mouseId || this.checkContinues(catId, mouseId)) {
                caughtMouseArr.push(mouse)
            }
        }

        return caughtMouseArr
    }

    //检测连续性
    checkContinues(catNum: number, mouseNum: number) {
        let posArr = this.getValidPos()
        if (posArr.length <= 0) {
            return false
        }
        if (catNum > mouseNum) {
            for (let i = mouseNum; i < catNum; i++) {
                if (posArr.indexOf(i) == -1) {
                    return false
                }
            }
        } else {
            for (let i = catNum; i < mouseNum; i++) {
                if (posArr.indexOf(i) == -1) {
                    return false
                }
            }
        }
        return true
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

    onUpdate() {
        if (GameLogicCrl.Share.isOver) return
        this.targetNode = null
        this.isCatchMouse = false
        let cmArr: Laya.Sprite3D[] = this.checkCanCatchMouse()
        if (cmArr.length > 0) {
            this.isCatchMouse = true
            //优先抓老鼠
            let mouse = this.closestMouse(cmArr)
            let cId: number = this.curId
            let mId: number = (mouse.getComponent(Mouse) as Mouse).curId
            if (cId == mId) {
                this.targetNode = mouse
            } else if (cId > mId) {
                this.isIncreaseId = true
                if (this.isStayPoint) {
                    this.targetNode = GameLogicCrl.Share.currentPosNode.getChildAt(this.curId - 1) as Laya.Sprite3D
                } else {
                    this.targetNode = GameLogicCrl.Share.currentPointsNode.getChildAt(this.curId) as Laya.Sprite3D
                }
            } else {
                this.isIncreaseId = false
                if (this.isStayPoint) {
                    this.targetNode = GameLogicCrl.Share.currentPosNode.getChildAt(this.curId) as Laya.Sprite3D
                } else {
                    this.targetNode = GameLogicCrl.Share.currentPointsNode.getChildAt(this.curId + 1) as Laya.Sprite3D
                }
            }
        } else {
            //寻找普通路径
            let vpArr: number[] = this.getValidPos()
            if (vpArr.length > 0) {
                for (let i = 0; i < vpArr.length; i++) {
                    let vpId = vpArr[i]
                    let cId = this.curId
                    if (Math.abs(vpId - cId) <= 1 && this.isStayPoint && this.prePosArr.indexOf(vpId) == -1) {
                        //相邻的pos
                        this.targetNode = GameLogicCrl.Share.currentPosNode.getChildAt(vpId) as Laya.Sprite3D
                        this.isIncreaseId = cId > vpId
                        return
                    }
                }
            }
            if (!this.isStayPoint)
                this.targetNode = GameLogicCrl.Share.currentPointsNode.getChildAt(this.curId) as Laya.Sprite3D
        }
    }

    onLateUpdate() {
        if (this.targetNode && this.tempTargetNode != this.targetNode && !this.isHurt && !GameLogicCrl.Share.isOver) {
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
            if (this.targetNode.parent && this.targetNode.parent.name == 'MouseNode' && dis <= 1) {
                //this.targetNode.destroy()
                GameLogicCrl.Share.mouseIsCaught(this.targetNode)
                this.targetNode = null
                this.tempTargetNode = this.targetNode
            } else if (this.targetNode.parent && this.targetNode.parent.name == 'PosNode' && dis <= 0.3) {
                if (this.isCatchMouse) {
                    if (this.isIncreaseId) {
                        this.curId--
                    } else {
                        this.curId++
                    }
                } else {
                    if (this.isIncreaseId) {
                        this.curId--
                    } else {
                        if (this.curId + 1 >= GameLogicCrl.Share.currentCollNode.numChildren) {
                            this.curId = 0
                        }
                    }
                }
                this.prePosArr.push(GameLogicCrl.Share.currentPosNode.getChildIndex(this.targetNode))
                this.isStayPoint = false
                this.tempTargetNode = this.targetNode
            } else if (this.targetNode.parent && this.targetNode.parent.name == 'PointNode' && dis <= 0.3) {
                if (this.isCatchMouse) {
                    if (this.isIncreaseId) {
                        this.curId--
                    } else {
                        this.curId++
                    }
                    this.isStayPoint = true
                } else {

                }
                this.isStayPoint = true
                this.tempTargetNode = this.targetNode
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