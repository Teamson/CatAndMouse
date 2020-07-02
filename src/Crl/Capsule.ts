export default class Capsule extends Laya.Script3D {
    constructor() {
        super()
    }
    myOwner: Laya.Sprite3D = null
    startPos: Laya.Vector3 = new Laya.Vector3(0, 0, 0)
    myDir: Laya.Vector3 = new Laya.Vector3(0, 0, 0)
    moveDis: number = 6

    isOpen: boolean = false

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
        this.startPos = this.myOwner.transform.position.clone()
        this.myOwner.transform.getUp(this.myDir)
        this.myDir = new Laya.Vector3(-this.myDir.x, -this.myDir.y, -this.myDir.z)
    }

    clicked() {
        if (this.isOpen) {
            this.myOwner.transform.position = this.startPos.clone()
        } else {
            let d = new Laya.Vector3(this.myDir.x * this.moveDis, this.myDir.y * this.moveDis, this.myDir.z * this.moveDis)
            let pos = new Laya.Vector3(0, 0, 0)
            Laya.Vector3.add(this.myOwner.transform.position.clone(), d, pos)
            this.myOwner.transform.position = pos
        }
        this.isOpen = !this.isOpen
    }
}