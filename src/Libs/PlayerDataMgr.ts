import Utility from "../Mod/Utility"

export class PlayerData {
    grade: number = 1
    power: number = 10
    coin: number = 0
    playerId: number = 0
    playerArr: number[] = []
    unlockSkinCount: number = 0
    exitTime: number = 0
}

export default class PlayerDataMgr {
    private static _playerData: PlayerData = null
    public static tempSkinId: number = -1
    public static freeSkinId: number = -1
    public static powerMax: number = 10

    //获取用户数据
    public static getPlayerData(): PlayerData {
        if (!localStorage.getItem('playerData')) {
            this._playerData = new PlayerData()
            for (let i = 0; i < 9; i++) {
                if (i == 0) {
                    this._playerData.playerArr.push(1)
                }
                else {
                    this._playerData.playerArr.push(0)
                }
            }
            localStorage.setItem('playerData', JSON.stringify(this._playerData))
        } else {
            if (this._playerData == null) {
                this._playerData = JSON.parse(localStorage.getItem('playerData')) as PlayerData
            }
        }
        return this._playerData
    }

    //设置用户数据
    public static setPlayerData() {
        localStorage.setItem('playerData', JSON.stringify(this._playerData))
    }

    //获取未有的皮肤
    public static getPlayerYet(): number[] {
        let arr: number[] = []
        for (let i = 0; i < this._playerData.playerArr.length; i++) {
            if (this._playerData.playerArr[i] < 0) {
                arr.push(i)
            }
        }
        return arr
    }

    public static changeCoin(dt: number) {
        this._playerData.coin += dt
        this.setPlayerData()
    }

    public static getPlayerSkin(id: number) {
        this._playerData.playerArr[id] = 1
        this._playerData.playerId = id
        this.setPlayerData()
    }

    public static setExitTime() {
        this._playerData.exitTime = new Date().getTime()
        this.setPlayerData()
    }

    public static decPower() {
        this._playerData.power--
        this.setPlayerData()
    }

    public static getPower(v: number) {
        this._playerData.power += v
        this.setPlayerData()
    }

}