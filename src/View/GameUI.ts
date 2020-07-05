import GameLogicCrl from "../Crl/GameLogicCrl"
import Utility from "../Mod/Utility"
import Capsule from "../Crl/Capsule"
import PlayerDataMgr, { PlayerData } from "../Libs/PlayerDataMgr"
import AStar from "../Libs/AStar"

export default class GameUI extends Laya.Scene {
    constructor() {
        super()
    }

    public selectColl: Laya.Sprite3D = null
    public collMoveDir: Laya.Vector3 = new Laya.Vector3(0, 0, 0)

    public prePos: Laya.Vector2 = new Laya.Vector2(0, 0)

    touchPanel: Laya.Panel = this['touchPanel']
    gradeNum: Laya.FontClip = this['gradeNums']

    onOpened(param?: any) {
        this.initData()
    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    initData() {
        this.touchPanel.on(Laya.Event.MOUSE_DOWN, this, this.touchStart)
        this.touchPanel.on(Laya.Event.MOUSE_MOVE, this, this.touchMove)
        this.touchPanel.on(Laya.Event.MOUSE_UP, this, this.touchEnd)

        this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString()
    }

    touchStart(event: Laya.Event) {
        let pos: Laya.Vector2 = new Laya.Vector2(event.stageX, event.stageY)
        let hitResult: Laya.HitResult = new Laya.HitResult()
        let ray: Laya.Ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0))
        GameLogicCrl.Share._camera.viewportPointToRay(pos, ray)
        GameLogicCrl.Share._scene.physicsSimulation.rayCast(ray, hitResult)
        if (hitResult.succeeded && hitResult.collider.owner.name == 'Coll') {
            let torus = hitResult.collider.owner.parent;
            (torus.getComponent(Capsule) as Capsule).clicked();
            GameLogicCrl.Share.checkStarPointIsColl()
            GameLogicCrl.Share.mouseMove()
        }
    }

    touchMove(event: Laya.Event) {

    }

    touchEnd(event: Laya.Event) {

    }
}