import GameLogicCrl from "../Crl/GameLogicCrl";
import StarPoint from "../Crl/StarPoint";

export default class AStar {
    public static mapNodeArr: Laya.Sprite3D[] = []
    public static currentNode: Laya.Sprite3D = null
    public static gridWidth: number = 1

    public static openList: any[] = []
    public static closeList: any[] = []

    public static initAStar() {
        this.mapNodeArr = []
        this.openList = []
        this.closeList = []
        this.currentNode = null
        for (let i = 0; i < GameLogicCrl.Share._starNode.numChildren; i++) {
            this.mapNodeArr.push(GameLogicCrl.Share._starNode.getChildAt(i) as Laya.Sprite3D)
        }
    }

    public static getMyStarId(pos: Laya.Vector3) {
        for (let i = 0; i < this.mapNodeArr.length; i++) {
            let n = this.mapNodeArr[i] as Laya.Sprite3D
            let nPos = new Laya.Vector2(n.transform.position.clone().x, n.transform.position.clone().z)
            let mPos = new Laya.Vector2(pos.x, pos.z)
            if (mPos.x <= nPos.x + this.gridWidth / 2 && mPos.x >= nPos.x - this.gridWidth / 2 &&
                mPos.y <= nPos.y + this.gridWidth / 2 && mPos.y >= nPos.y - this.gridWidth / 2) {
                return i
            }
        }
        return -1
    }

    public static getNodeById(id: number): Laya.Sprite3D {
        return this.mapNodeArr[id]
    }

    public static getArrIndexById(id: number): Laya.Vector2 {
        let xx = Math.floor(id % 9)
        let yy = Math.floor(id / 9)
        return new Laya.Vector2(xx, yy)
    }

    public static getPCrl(id: number): StarPoint {
        let p = this.getNodeById(id)
        let crl = p.getComponent(StarPoint)
        return crl
    }

    public static getNearGrids(id: number) {
        let arr: Laya.Sprite3D[] = []
        if (this.getPCrl(id).arrIndex.y - 1 >= 0) {
            let n = this.getNodeById(id - 9)
            if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                arr.push(n)
        }
        if (this.getPCrl(id).arrIndex.x + 1 <= 8) {
            let n = this.getNodeById(id + 1)
            if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                arr.push(n)
        }
        if (this.getPCrl(id).arrIndex.y + 1 <= 12) {
            let n = this.getNodeById(id + 9)
            if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                arr.push(n)
        }
        if (this.getPCrl(id).arrIndex.x - 1 >= 0) {
            let n = this.getNodeById(id - 1)
            if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                arr.push(n)
        }
        return arr
    }

    public static readyToCal(startId: number, endId: number): Laya.Sprite3D[] {
        this.closeList = []
        this.openList = []
        this.currentNode = null
        for (let i = 0; i < this.mapNodeArr.length; i++) {
            (this.mapNodeArr[i].getComponent(StarPoint) as StarPoint).aStarF = 0;
            (this.mapNodeArr[i].getComponent(StarPoint) as StarPoint).aStarG = 0;
            (this.mapNodeArr[i].getComponent(StarPoint) as StarPoint).aStarH = 0;
        }
        this.closeList.push(this.getNodeById(startId))
        this.currentNode = this.getNodeById(startId)
        this.calWayPoint(startId, endId)
        if (this.closeList.length <= 0) {
            return []
        }
        return this.closeList[this.closeList.length - 1].getComponent(StarPoint).myId == endId ? this.closeList : []
    }

    public static calWayPoint(startId: number, endId: number) {
        let nArr: Laya.Sprite3D[] = this.getNearGrids(startId)
        if (nArr.length <= 0) {
            return
        }
        let minF = 999
        let minN = null
        for (let i = 0; i < nArr.length; i++) {
            let n = nArr[i] as Laya.Sprite3D
            let nCrl = n.getComponent(StarPoint) as StarPoint

            nCrl.aStarG += 10 + this.currentNode.getComponent(StarPoint).aStarG
            nCrl.aStarH = Math.abs(nCrl.arrIndex.x - this.getArrIndexById(endId).x) + Math.abs(nCrl.arrIndex.y - this.getArrIndexById(endId).y)
            nCrl.aStarF = nCrl.aStarG + nCrl.aStarH
            if (nCrl.aStarF <= minF) {
                minF = nCrl.aStarF
                minN = n
            }
            this.openList.push(n)
        }
        if (minN) {
            this.closeList.push(minN)
            this.currentNode = minN
            if (minN.getComponent(StarPoint).myId == endId) {
                //结束
            } else {
                let closeListLength = this.closeList.length
                this.calWayPoint(this.mapNodeArr.indexOf(minN), endId)
                if (closeListLength == this.closeList.length) {
                    //下一步无效
                    this.closeList.splice(this.closeList.indexOf(minN), 1)
                    nArr.splice(nArr.indexOf(minN), 1)
                    if (nArr.length > 0) {
                        let n = nArr[0]
                        this.calWayPoint(this.mapNodeArr.indexOf(n), endId)
                    }
                }
            }
        } else {
            //结束

        }
    }
}