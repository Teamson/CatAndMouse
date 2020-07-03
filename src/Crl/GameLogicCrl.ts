import WxApi from "../Libs/WxApi";
import Mouse from "./Mouse";
import Capsule from "./Capsule";
import Cat from "./Cat";
import Cheese from "./Cheese";
import PlayerDataMgr from "../Libs/PlayerDataMgr";
import Clip from "./Clip";
import TimeCountMgr from "../Libs/TimeCountMgr";
import ShareMgr from "../Mod/ShareMgr";
import StarPoint from "./StarPoint";

export default class GameLogicCrl {
    public static Share: GameLogicCrl

    public _scene: Laya.Scene3D
    public _camera: Laya.Camera
    private _light: Laya.DirectionLight

    public _gradeScene: Laya.Sprite3D = null
    public _Cat: Laya.Sprite3D = null
    public _MouseNode: Laya.Sprite3D = null

    public _starNode: Laya.Sprite3D = null
    public currentCollNode: Laya.Sprite3D = null
    public currentPointsNode: Laya.Sprite3D = null
    public currentPosNode: Laya.Sprite3D = null
    public validPointArr: Laya.Sprite3D[] = []
    public propNode: Laya.Sprite3D = null
    public collPoints: Laya.Sprite3D[] = []

    public cheeseId: number = -1
    public countForWin: number = 10
    public isVictory: boolean = false
    public isDefeat: boolean = false
    public isOver: boolean = false

    constructor() {
        localStorage.clear()
        GameLogicCrl.Share = this

        //初始化分享
        ShareMgr.instance.initShare()
        //初始化用户缓存数据
        PlayerDataMgr.getPlayerData()
        //体力计算
        new TimeCountMgr()

        Laya.Scene.open('MyScenes/LoadingUI.scene')
    }

    initScene() {
        Laya.Scene3D.load(WxApi.UnityPath + 'Scene1.ls', Laya.Handler.create(this, this.onLoadScene));
    }
    onLoadScene(scene) {
        this._scene = Laya.stage.addChild(scene) as Laya.Scene3D
        Laya.stage.setChildIndex(this._scene, 0)

        this._camera = this._scene.getChildByName('Main Camera') as Laya.Camera
        this._light = this._scene.getChildByName('Directional Light') as Laya.DirectionLight
        this._starNode = this._scene.getChildByName('AStarNode') as Laya.Sprite3D

        this.createGameScene()
        for (let i = 0; i < this._starNode.numChildren; i++) {
            let s = this._starNode.getChildAt(i) as Laya.Sprite3D
            s.addComponent(StarPoint)
        }
    }

    createGameScene() {
        let curGid: number = 1//PlayerDataMgr.getPlayerData().grade
        let sceneRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Scene' + curGid + '.lh') as Laya.Sprite3D
        this._gradeScene = Laya.Sprite3D.instantiate(sceneRes, this._scene, false, new Laya.Vector3(0, 0, 0));

        this._Cat = this._gradeScene.getChildByName('Cat') as Laya.Sprite3D
        this._MouseNode = this._gradeScene.getChildByName('MouseNode') as Laya.Sprite3D
        this.currentCollNode = this._gradeScene.getChildByName('CollNode') as Laya.Sprite3D
        this.currentPointsNode = this._gradeScene.getChildByName('PointNode') as Laya.Sprite3D
        this.currentPosNode = this._gradeScene.getChildByName('PosNode') as Laya.Sprite3D
        this.propNode = this._gradeScene.getChildByName('PropNode') as Laya.Sprite3D

        for (let i = 0; i < this.currentCollNode.numChildren; i++) {
            let pn = this._gradeScene.getChildByName('PointNode') as Laya.Sprite3D
            for (let j = 0; j < pn.numChildren; j++) {
                this.collPoints.push(pn.getChildAt(j) as Laya.Sprite3D)
            }
        }

        this.addCollComponents()
        this.addPropComponents()

        this.countForWin = this._MouseNode.numChildren - 3
        for (let i = 0; i < this._MouseNode.numChildren; i++) {
            let mouse = this._MouseNode.getChildAt(i) as Laya.Sprite3D
            mouse.addComponent(Mouse)
        }

        if (this._Cat)
            this._Cat.addComponent(Cat)
    }

    addCollComponents() {
        for (let i = 0; i < this.currentCollNode.numChildren; i++) {
            let coll = this.currentCollNode.getChildAt(i) as Laya.Sprite3D
            coll.addComponent(Capsule)
        }
    }

    addPropComponents() {
        if (this.propNode.getChildByName('Cheese')) {
            let c = this.propNode.getChildByName('Cheese') as Laya.Sprite3D
            c.addComponent(Cheese)
            if (c.numChildren > 0) {
                this.cheeseId = parseInt(c.getChildAt(0).name)
            }
        }
        if (this.propNode.getChildByName('Clip')) {
            let c = this.propNode.getChildByName('Clip') as Laya.Sprite3D
            c.addComponent(Clip)
        }
    }

    getPropByName(name: string): Laya.Sprite3D {
        return this.propNode.getChildByName(name) as Laya.Sprite3D
    }

    mouseIsCaught(mouse: Laya.Sprite3D) {
        mouse.destroy()
        if (this._MouseNode.numChildren < this.countForWin) {
            this.gameOverCallback()
        }
    }

    winCallback() {
        if (this.isVictory) return
        this.isVictory = true
        this.isOver = true
        Laya.Scene.open('MyScenes/VictoryUI.scene')
    }

    gameOverCallback() {
        if (this.isDefeat) return
        this.isDefeat = true
        this.isOver = true
        Laya.Scene.open('MyScenes/DefeatUI.scene')
    }

    restartGame() {
        this.isVictory = false
        this.isDefeat = false
        this.isOver = false
        this._gradeScene.removeChildren()
        this._gradeScene.removeSelf()
        this._gradeScene = null
        this.createGameScene()
    }
}