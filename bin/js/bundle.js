(function () {
    'use strict';

    class WxApi {
        static LoginWx(cb) {
            if (!Laya.Browser.onWeiXin)
                return;
            let launchData = Laya.Browser.window.wx.getLaunchOptionsSync();
            Laya.Browser.window.wx.login({
                success(res) {
                    if (res.code) {
                        console.log('res.code:', res.code);
                        if (cb) {
                            cb(res.code, launchData.query);
                        }
                    }
                }
            });
        }
        static checkScope(btnNode) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.getSetting({
                    success: (response) => {
                        if (!response.authSetting['scope.userInfo']) {
                            console.log('没有授权');
                            this.createScope(btnNode);
                        }
                        else {
                            console.log('已经授权');
                        }
                    }
                });
            }
        }
        static createScope(btnNode) {
            this.scopeBtn = Laya.Browser.window.wx.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                    left: btnNode.x,
                    top: btnNode.y,
                    width: btnNode.width,
                    height: btnNode.height,
                    lineHeight: 40,
                    backgroundColor: '#ffffff',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 0
                }
            });
            this.scopeBtn.onTap((res) => {
                if (res.errMsg == "getUserInfo:ok") {
                    this.scopeBtn.destroy();
                    this.scopeBtn = null;
                }
                else if (res.errMsg == 'getUserInfo:fail auth deny') {
                    this.scopeBtn.destroy();
                    this.scopeBtn = null;
                }
            });
        }
        static GetLaunchParam(fun) {
            if (Laya.Browser.onWeiXin) {
                this.OnShowFun = fun;
                fun(this.GetLaunchPassVar());
                Laya.Browser.window.wx.onShow((para) => {
                    if (this.OnShowFun != null) {
                        this.OnShowFun(para);
                    }
                    console.log("wx on show");
                });
            }
        }
        static GetLaunchPassVar() {
            if (Laya.Browser.onWeiXin) {
                return Laya.Browser.window.wx.getLaunchOptionsSync();
            }
            else {
                return null;
            }
        }
        static WxOnHide(fun) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.onHide(fun);
            }
        }
        static httpRequest(url, params, type = 'get', completeHandler) {
            var xhr = new Laya.HttpRequest();
            xhr.http.timeout = 5000;
            xhr.once(Laya.Event.COMPLETE, this, completeHandler);
            xhr.once(Laya.Event.ERROR, this, this.httpRequest, [url, params, type, completeHandler]);
            if (type == "get") {
                xhr.send(url + '?' + params, "", type, "text");
            }
            else if (type == "post") {
                xhr.send(url, JSON.stringify(params), type, "text");
            }
        }
        static DoVibrate(isShort = true) {
            if (Laya.Browser.onWeiXin && this.isVibrate) {
                if (isShort) {
                    Laya.Browser.window.wx.vibrateShort();
                }
                else {
                    Laya.Browser.window.wx.vibrateLong();
                }
            }
        }
        static OpenAlert(msg, dur = 2000, icon = false) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.showToast({
                    title: msg,
                    duration: dur,
                    mask: false,
                    icon: icon ? 'success' : 'none',
                });
            }
        }
        static NavigateApp(appid, path, title, cancelCB, successCB) {
            if (Laya.Browser.onWeiXin) {
                let self = this;
                Laya.Browser.window.wx.navigateToMiniProgram({
                    appId: appid,
                    path: path,
                    success(res) {
                        console.log('打开成功');
                        successCB();
                    },
                    fail(res) {
                        console.log('打开失败');
                        cancelCB();
                    }
                });
            }
        }
        static preViewImage(url) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.previewImage({
                    current: url,
                    urls: [url]
                });
            }
        }
        static aldEvent(str) {
            if (Laya.Browser.onWeiXin)
                Laya.Browser.window.wx.aldSendEvent(str);
        }
    }
    WxApi.UnityPath = 'LayaScene_Scene1/Conventional/';
    WxApi.version = '1.0.0';
    WxApi.isVibrate = true;
    WxApi.isMusic = true;
    WxApi.OnShowFun = null;
    WxApi.scopeBtn = null;
    WxApi.shareCallback = null;
    WxApi.front_share_number = 0;
    WxApi.gotOfflineBounes = false;
    WxApi.configData = null;
    WxApi.shareTime = 0;
    WxApi.firstShare = true;
    WxApi.hadShowFriendUI = false;
    WxApi.launchGameUI = false;
    WxApi.firstStartGame = false;

    var PropName;
    (function (PropName) {
        PropName["PROP_CLIP"] = "Clip";
        PropName["PROP_INDOOR"] = "InDoor";
        PropName["PROP_OUTDOOR"] = "OutDoor";
        PropName["PROP_PEPPER"] = "Pepper";
        PropName["PROP_COIN"] = "Coin";
        PropName["PROP_FIRE"] = "Fire";
        PropName["PROP_CHEESE"] = "Cheese";
        PropName["PROP_DESDOOR"] = "DesDoor";
    })(PropName || (PropName = {}));

    class StarPoint extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this.myBox = null;
            this.arrIndex = new Laya.Vector2(0, 0);
            this.myId = 0;
            this.aStarF = 0;
            this.aStarG = 0;
            this.aStarH = 0;
            this.isColl = false;
        }
        onAwake() {
            this.myOwner = this.owner;
            this.myId = this.myOwner.parent.getChildIndex(this.myOwner);
            this.arrIndex.x = Math.floor(this.myId % 9);
            this.arrIndex.y = Math.floor(this.myId / 9);
            this.checkIsColl();
        }
        checkIsColl() {
            for (let i = 0; i < GameLogicCrl.Share.collPoints.length; i++) {
                let c = GameLogicCrl.Share.collPoints[i];
                let cPos = new Laya.Vector2(c.transform.position.clone().x, c.transform.position.clone().z);
                let mPos = new Laya.Vector2(this.myOwner.transform.position.clone().x, this.myOwner.transform.position.clone().z);
                if (mPos.x <= cPos.x + AStar.gridWidth / 2 && mPos.x >= cPos.x - AStar.gridWidth / 2 &&
                    mPos.y <= cPos.y + AStar.gridWidth / 2 && mPos.y >= cPos.y - AStar.gridWidth / 2) {
                    this.isColl = true;
                    return;
                }
            }
            this.isColl = false;
        }
        onUpdate() {
        }
    }

    class AStar {
        static initAStar() {
            this.mapNodeArr = [];
            this.openList = [];
            this.closeList = [];
            this.currentNode = null;
            for (let i = 0; i < GameLogicCrl.Share._starNode.numChildren; i++) {
                this.mapNodeArr.push(GameLogicCrl.Share._starNode.getChildAt(i));
            }
        }
        static getMyStarId(pos) {
            for (let i = 0; i < this.mapNodeArr.length; i++) {
                let n = this.mapNodeArr[i];
                let nPos = new Laya.Vector2(n.transform.position.clone().x, n.transform.position.clone().z);
                let mPos = new Laya.Vector2(pos.x, pos.z);
                if (mPos.x <= nPos.x + this.gridWidth / 2 && mPos.x >= nPos.x - this.gridWidth / 2 &&
                    mPos.y <= nPos.y + this.gridWidth / 2 && mPos.y >= nPos.y - this.gridWidth / 2) {
                    return i;
                }
            }
            return -1;
        }
        static getNodeById(id) {
            return this.mapNodeArr[id];
        }
        static getArrIndexById(id) {
            let xx = Math.floor(id % 9);
            let yy = Math.floor(id / 9);
            return new Laya.Vector2(xx, yy);
        }
        static getPCrl(id) {
            let p = this.getNodeById(id);
            let crl = p.getComponent(StarPoint);
            return crl;
        }
        static getNearGrids(id) {
            let arr = [];
            if (this.getPCrl(id).arrIndex.y - 1 >= 0) {
                let n = this.getNodeById(id - 9);
                if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                    arr.push(n);
            }
            if (this.getPCrl(id).arrIndex.x + 1 <= 8) {
                let n = this.getNodeById(id + 1);
                if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                    arr.push(n);
            }
            if (this.getPCrl(id).arrIndex.y + 1 <= 12) {
                let n = this.getNodeById(id + 9);
                if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                    arr.push(n);
            }
            if (this.getPCrl(id).arrIndex.x - 1 >= 0) {
                let n = this.getNodeById(id - 1);
                if (this.closeList.indexOf(n) == -1 && this.openList.indexOf(n) == -1 && !n.getComponent(StarPoint).isColl)
                    arr.push(n);
            }
            return arr;
        }
        static readyToCal(startId, endId) {
            this.closeList = [];
            this.openList = [];
            this.currentNode = null;
            for (let i = 0; i < this.mapNodeArr.length; i++) {
                this.mapNodeArr[i].getComponent(StarPoint).aStarF = 0;
                this.mapNodeArr[i].getComponent(StarPoint).aStarG = 0;
                this.mapNodeArr[i].getComponent(StarPoint).aStarH = 0;
            }
            this.closeList.push(this.getNodeById(startId));
            this.currentNode = this.getNodeById(startId);
            this.calWayPoint(startId, endId);
            if (this.closeList.length <= 0) {
                return [];
            }
            return this.closeList[this.closeList.length - 1].getComponent(StarPoint).myId == endId ? this.closeList : [];
        }
        static calWayPoint(startId, endId) {
            let nArr = this.getNearGrids(startId);
            if (nArr.length <= 0) {
                return;
            }
            let minF = 999;
            let minN = null;
            for (let i = 0; i < nArr.length; i++) {
                let n = nArr[i];
                let nCrl = n.getComponent(StarPoint);
                nCrl.aStarG += 10 + this.currentNode.getComponent(StarPoint).aStarG;
                nCrl.aStarH = Math.abs(nCrl.arrIndex.x - this.getArrIndexById(endId).x) + Math.abs(nCrl.arrIndex.y - this.getArrIndexById(endId).y);
                nCrl.aStarF = nCrl.aStarG + nCrl.aStarH;
                if (nCrl.aStarF <= minF) {
                    minF = nCrl.aStarF;
                    minN = n;
                }
                this.openList.push(n);
            }
            if (minN) {
                this.closeList.push(minN);
                this.currentNode = minN;
                if (minN.getComponent(StarPoint).myId == endId) {
                }
                else {
                    let closeListLength = this.closeList.length;
                    this.calWayPoint(this.mapNodeArr.indexOf(minN), endId);
                    if (closeListLength == this.closeList.length) {
                        this.closeList.splice(this.closeList.indexOf(minN), 1);
                        nArr.splice(nArr.indexOf(minN), 1);
                        if (nArr.length > 0) {
                            let n = nArr[0];
                            this.calWayPoint(this.mapNodeArr.indexOf(n), endId);
                        }
                    }
                }
            }
            else {
            }
        }
    }
    AStar.mapNodeArr = [];
    AStar.currentNode = null;
    AStar.gridWidth = 1;
    AStar.openList = [];
    AStar.closeList = [];

    class Mouse extends Laya.Script3D {
        constructor() {
            super();
            this.myOwner = null;
            this._body = null;
            this._ani = null;
            this.targetNode = null;
            this.tempTargetNode = null;
            this.isGotDes = false;
            this.isGotCheese = false;
            this.isHurt = false;
            this.curId = 0;
            this.speed = 0.05;
            this.starId = 0;
            this.wayPointArr = [];
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.myOwner.getComponent(Laya.Animator);
            this.playAniByName('idle');
            this._body = this.myOwner.getComponent(Laya.Rigidbody3D);
            this.starId = AStar.getMyStarId(this.myOwner.transform.position.clone());
        }
        playAniByName(name) {
            this._ani.play(name);
        }
        findWayPoint(endId) {
            this.targetNode = null;
            this.wayPointArr = [];
            if (this.starId == -1)
                return;
            this.wayPointArr = AStar.readyToCal(this.starId, endId);
            if (this.wayPointArr.length <= 0) {
                return;
            }
            this.targetNode = this.wayPointArr[0];
        }
        onUpdate() {
            this.starId = AStar.getMyStarId(this.myOwner.transform.position.clone());
        }
        onLateUpdate() {
            if (this.targetNode != null && !this.isHurt && !GameLogicCrl.Share.isDefeat) {
                this.myOwner.transform.lookAt(this.targetNode.transform.position.clone(), new Laya.Vector3(0, 1, 0));
                this.myOwner.transform.localRotationEulerY += 180;
                let dir = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.subtract(this.targetNode.transform.position.clone(), this.myOwner.transform.position.clone(), dir);
                Laya.Vector3.normalize(dir, dir);
                dir = new Laya.Vector3(dir.x * this.speed, dir.y * this.speed, dir.z * this.speed);
                let pos = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.add(this.myOwner.transform.position.clone(), dir, pos);
                this.myOwner.transform.position = pos.clone();
                if (this._ani.getCurrentAnimatorPlayState().animatorState.name != 'run') {
                    this.playAniByName('run');
                }
                let dis = Laya.Vector3.distance(this.myOwner.transform.position.clone(), this.targetNode.transform.position.clone());
                if (dis <= 0.2) {
                    if (this.wayPointArr.length > 1) {
                        this.wayPointArr.splice(0, 1);
                        this.targetNode = this.wayPointArr[0];
                    }
                    else {
                        this.targetNode = null;
                    }
                }
            }
            else {
                if (this._ani.getCurrentAnimatorPlayState().animatorState.name == 'run') {
                    this.playAniByName('idle');
                }
                this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
            }
        }
        onTriggerEnter(other) {
        }
        onCollisionEnter(collision) {
        }
        checkIsProp(prop) {
            switch (prop.name) {
                case PropName.PROP_CLIP:
                    break;
                case PropName.PROP_INDOOR:
                    this.triggerInDoor();
                    break;
                case PropName.PROP_PEPPER:
                    this.triggerPepper();
                    break;
                case PropName.PROP_FIRE:
                    this.triggerFire();
                    break;
                case PropName.PROP_COIN:
                    this.triggerCoin();
                    break;
                case PropName.PROP_CHEESE:
                    break;
                case PropName.PROP_DESDOOR:
                    this.myOwner.destroy();
                    console.log('des door');
                    break;
            }
        }
        triggerClip(prop) {
            prop.removeSelf();
            this.isHurt = true;
            this.playAniByName('hurt');
            this._body.isTrigger = true;
        }
        triggerInDoor() {
        }
        triggerPepper() {
        }
        triggerFire() {
        }
        triggerCoin() {
        }
    }

    class Capsule extends Laya.Script3D {
        constructor() {
            super();
            this.myOwner = null;
            this.startPos = new Laya.Vector3(0, 0, 0);
            this.myDir = new Laya.Vector3(0, 0, 0);
            this.moveDis = 6;
            this.isOpen = false;
        }
        onAwake() {
            this.myOwner = this.owner;
            this.startPos = this.myOwner.transform.position.clone();
            this.myOwner.transform.getUp(this.myDir);
            this.myDir = new Laya.Vector3(-this.myDir.x, -this.myDir.y, -this.myDir.z);
        }
        clicked() {
            if (this.isOpen) {
                this.myOwner.transform.position = this.startPos.clone();
            }
            else {
                let d = new Laya.Vector3(this.myDir.x * this.moveDis, this.myDir.y * this.moveDis, this.myDir.z * this.moveDis);
                let pos = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.add(this.myOwner.transform.position.clone(), d, pos);
                this.myOwner.transform.position = pos;
            }
            this.isOpen = !this.isOpen;
        }
    }

    class Cat extends Laya.Script3D {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this._body = null;
            this.targetNode = null;
            this.isHurt = false;
            this.speed = 0.06;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.myOwner.getComponent(Laya.Animator);
            this._body = this.myOwner.getComponent(Laya.Rigidbody3D);
            this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
        }
        playAniByName(name) {
            this._ani.play(name);
        }
        closestMouse(arr) {
            if (arr.length <= 0) {
                return null;
            }
            arr.sort((a, b) => {
                return Laya.Vector3.distance(this.myOwner.transform.position.clone(), a.transform.position.clone()) -
                    Laya.Vector3.distance(this.myOwner.transform.position.clone(), b.transform.position.clone());
            });
            return arr[0];
        }
        checkCanCatchMouse() {
            let cArr = [];
            let lMin = 999;
            for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
                let m = GameLogicCrl.Share._MouseNode.getChildAt(i);
                let mCrl = m.getComponent(Mouse);
                if (mCrl.starId == -1) {
                    continue;
                }
                let cId = AStar.getMyStarId(this.myOwner.transform.position.clone());
                let arr = AStar.readyToCal(cId, mCrl.starId);
                if (arr.length <= 0)
                    continue;
                if (arr.length <= lMin) {
                    cArr = arr;
                    lMin = arr.length;
                }
            }
            if (cArr.length > 0) {
                return cArr;
            }
            else {
                return [];
            }
        }
        onUpdate() {
            if (GameLogicCrl.Share.isOver || this.targetNode)
                return;
            let arr = this.checkCanCatchMouse();
            if (arr.length > 1) {
                this.targetNode = arr[1];
            }
        }
        onLateUpdate() {
            if (!this.isHurt) {
                for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
                    let m = GameLogicCrl.Share._MouseNode.getChildAt(i);
                    if (Laya.Vector3.distance(this.myOwner.transform.position.clone(), m.transform.position.clone()) <= 1) {
                        GameLogicCrl.Share.mouseIsCaught(m);
                    }
                }
            }
            if (this.targetNode && !this.isHurt && !GameLogicCrl.Share.isOver) {
                this.myOwner.transform.lookAt(this.targetNode.transform.position.clone(), new Laya.Vector3(0, 1, 0));
                this.myOwner.transform.localRotationEulerY += 180;
                let dir = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.subtract(this.targetNode.transform.position.clone(), this.myOwner.transform.position.clone(), dir);
                Laya.Vector3.normalize(dir, dir);
                dir = new Laya.Vector3(dir.x * this.speed, dir.y * this.speed, dir.z * this.speed);
                let pos = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.add(this.myOwner.transform.position.clone(), dir, pos);
                this.myOwner.transform.position = pos.clone();
                if (this._ani.getCurrentAnimatorPlayState().animatorState.name != 'walk') {
                    this.playAniByName('walk');
                }
                let dis = Laya.Vector3.distance(this.myOwner.transform.position.clone(), this.targetNode.transform.position.clone());
                if (dis <= 0.2) {
                    this.targetNode = null;
                }
            }
            else {
                if (this._ani.getCurrentAnimatorPlayState().animatorState.name == 'walk') {
                    this.playAniByName('idle');
                }
                this._body.linearVelocity = new Laya.Vector3(0, 0, 0);
            }
        }
        onCollisionEnter(collision) {
        }
        checkIsProp(prop) {
            switch (prop.name) {
                case PropName.PROP_CLIP:
                    this.triggerClip(prop);
                    break;
            }
        }
        triggerClip(prop) {
            prop.removeSelf();
            this.isHurt = true;
            this.playAniByName('hurt');
            this._body.isTrigger = true;
        }
    }

    class Cheese extends Laya.Script3D {
        constructor() {
            super();
            this.myOwner = null;
            this.gotCount = 0;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onUpdate() {
            if (GameLogicCrl.Share._MouseNode) {
                for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
                    let m = GameLogicCrl.Share._MouseNode.getChildAt(i);
                    let mCrl = m.getComponent(Mouse);
                    if (Laya.Vector3.distance(m.transform.position.clone(), this.myOwner.transform.position.clone()) <= 1 && !mCrl.isGotCheese) {
                        mCrl.isGotCheese = true;
                        this.gotCount++;
                        if (this.gotCount >= GameLogicCrl.Share.countForWin) {
                            GameLogicCrl.Share.winCallback();
                        }
                        console.log('got cheese');
                    }
                }
            }
        }
    }

    class PlayerData {
        constructor() {
            this.grade = 1;
            this.power = 10;
            this.coin = 0;
            this.playerId = 0;
            this.playerArr = [];
            this.unlockSkinCount = 0;
            this.exitTime = 0;
        }
    }
    class PlayerDataMgr {
        static getPlayerData() {
            if (!localStorage.getItem('playerData')) {
                this._playerData = new PlayerData();
                for (let i = 0; i < 9; i++) {
                    if (i == 0) {
                        this._playerData.playerArr.push(1);
                    }
                    else {
                        this._playerData.playerArr.push(0);
                    }
                }
                localStorage.setItem('playerData', JSON.stringify(this._playerData));
            }
            else {
                if (this._playerData == null) {
                    this._playerData = JSON.parse(localStorage.getItem('playerData'));
                }
            }
            return this._playerData;
        }
        static setPlayerData() {
            localStorage.setItem('playerData', JSON.stringify(this._playerData));
        }
        static getPlayerYet() {
            let arr = [];
            for (let i = 0; i < this._playerData.playerArr.length; i++) {
                if (this._playerData.playerArr[i] < 0) {
                    arr.push(i);
                }
            }
            return arr;
        }
        static changeCoin(dt) {
            this._playerData.coin += dt;
            this.setPlayerData();
        }
        static getPlayerSkin(id) {
            this._playerData.playerArr[id] = 1;
            this._playerData.playerId = id;
            this.setPlayerData();
        }
        static setExitTime() {
            this._playerData.exitTime = new Date().getTime();
            this.setPlayerData();
        }
        static decPower() {
            this._playerData.power--;
            this.setPlayerData();
        }
        static getPower(v) {
            this._playerData.power += v;
            this.setPlayerData();
        }
    }
    PlayerDataMgr._playerData = null;
    PlayerDataMgr.tempSkinId = -1;
    PlayerDataMgr.freeSkinId = -1;
    PlayerDataMgr.powerMax = 10;

    class Clip extends Laya.Script3D {
        constructor() {
            super();
            this.myOwner = null;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onUpdate() {
            if (GameLogicCrl.Share._Cat) {
                if (Laya.Vector3.distance(GameLogicCrl.Share._Cat.transform.position.clone(), this.myOwner.transform.position.clone()) <= 0.8) {
                    let cCrl = GameLogicCrl.Share._Cat.getComponent(Cat);
                    cCrl.triggerClip(this.myOwner);
                }
            }
            for (let i = 0; i < GameLogicCrl.Share._MouseNode.numChildren; i++) {
                let mouse = GameLogicCrl.Share._MouseNode.getChildAt(i);
                let mCrl = mouse.getComponent(Mouse);
                if (Laya.Vector3.distance(mouse.transform.position.clone(), this.myOwner.transform.position.clone()) <= 0.5) {
                    mCrl.triggerClip(this.myOwner);
                }
            }
        }
    }

    class TimeCountMgr {
        constructor() {
            this.tCount = 0;
            TimeCountMgr.Share = this;
            this.init();
        }
        init() {
            if (localStorage.getItem('powerTime')) {
                this.tCount = parseInt(localStorage.getItem('powerTime'));
            }
            else {
                localStorage.setItem('power', '0');
            }
            this.calculateExitTime();
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.onShow((para) => {
                    this.calculateExitTime();
                });
                Laya.Browser.window.wx.onHide((para) => {
                    localStorage.setItem('powerTime', this.tCount.toString());
                    localStorage.setItem('exitTime', new Date().getTime().toString());
                });
            }
            Laya.timer.loop(1000, this, this.calculateTime);
        }
        calculateExitTime() {
            let exitTime = 0;
            if (localStorage.getItem('exitTime')) {
                exitTime = new Date().getTime() - parseInt(localStorage.getItem('exitTime'));
            }
            if (exitTime <= 0)
                return;
            exitTime /= 1000;
            let t = Math.floor(exitTime / 600);
            PlayerDataMgr.getPlayerData().power += t;
            if (PlayerDataMgr.getPlayerData().power > PlayerDataMgr.powerMax) {
                PlayerDataMgr.getPlayerData().power = PlayerDataMgr.powerMax;
                PlayerDataMgr.setPlayerData();
            }
        }
        calculateTime() {
            if (this.tCount <= 0) {
                if (PlayerDataMgr.getPlayerData().power < PlayerDataMgr.powerMax) {
                    this.tCount = 600;
                }
                else {
                    this.tCount = 0;
                }
                return;
            }
            this.tCount--;
            if (this.tCount <= 0) {
                if (PlayerDataMgr.getPlayerData().power < PlayerDataMgr.powerMax) {
                    PlayerDataMgr.getPlayerData().power += 1;
                    PlayerDataMgr.setPlayerData();
                    this.tCount = PlayerDataMgr.getPlayerData().power < PlayerDataMgr.powerMax ? 600 : 0;
                }
            }
        }
    }

    class SoundMgr {
        static get instance() {
            if (!this._instance) {
                this._instance = new SoundMgr();
            }
            return this._instance;
        }
        initLoading(fun) {
            var resUrl = [
                { url: 'res/sounds/bgm.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit3.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/die1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/die2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/getCoin.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit3.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit4.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponReady.mp3', type: Laya.Loader.SOUND }
            ];
            Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
            Laya.SoundManager.useAudioMusic = true;
            Laya.SoundManager.setMusicVolume(1);
        }
        playMusic(str, loops = 0, cb) {
            Laya.SoundManager.playMusic('res/sounds/' + str, loops, new Laya.Handler(this, cb));
        }
        stopMusic() {
            Laya.SoundManager.stopMusic();
        }
        playSoundEffect(str, loops = 1, cb) {
            Laya.SoundManager.playSound('res/sounds/' + str, loops, new Laya.Handler(this, cb));
        }
    }

    class AdMgr {
        constructor() {
            this.bannerUnitId = ['adunit-441b22cb32c3f6b7', 'adunit-ca1d1fda0b8c4a03'];
            this.videoUnitId = 'adunit-c35dcf999bc0fcf3';
            this.bannerAd = null;
            this.videoAd = null;
            this.videoCallback = null;
            this.curBannerId = 0;
            this.showBannerCount = 0;
            this.videoIsError = false;
            this.videoLoaded = false;
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new AdMgr();
            }
            return this._instance;
        }
        initAd() {
            if (Laya.Browser.onWeiXin) {
                this.initBanner();
                this.initVideo();
            }
        }
        initBanner() {
            let isIphonex = false;
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.getSystemInfo({
                    success: res => {
                        let modelmes = res.model;
                        if (modelmes.search('iPhone X') != -1) {
                            isIphonex = true;
                        }
                    }
                });
            }
            let winSize = Laya.Browser.window.wx.getSystemInfoSync();
            this.bannerAd = Laya.Browser.window.wx.createBannerAd({
                adUnitId: this.bannerUnitId[this.curBannerId],
                style: {
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 300
                }
            });
            this.bannerAd.onResize(res => {
                if (isIphonex) {
                    this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight - 10;
                }
                else {
                    this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight;
                }
                this.bannerAd.style.left = winSize.windowWidth / 2 - this.bannerAd.style.realWidth / 2;
            });
            this.bannerAd.onError(res => {
                console.log('banner error:', JSON.stringify(res));
            });
        }
        hideBanner() {
            if (Laya.Browser.onWeiXin) {
                this.bannerAd.hide();
            }
        }
        showBanner() {
            if (Laya.Browser.onWeiXin) {
                this.showBannerCount++;
                this.bannerAd.show();
            }
        }
        destroyBanner() {
            if (Laya.Browser.onWeiXin && this.bannerAd) {
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
        }
        initVideo() {
            if (!Laya.Browser.onWeiXin) {
                return;
            }
            if (!this.videoAd) {
                this.videoAd = Laya.Browser.window.wx.createRewardedVideoAd({
                    adUnitId: this.videoUnitId
                });
            }
            this.loadVideo();
            this.videoAd.onLoad(() => {
                console.log('激励视频加载成功');
                this.videoLoaded = true;
            });
            this.videoAd.onError(res => {
                console.log('video Error:', JSON.stringify(res));
                this.videoIsError = true;
            });
        }
        loadVideo() {
            if (Laya.Browser.onWeiXin && this.videoAd != null) {
                this.videoIsError = false;
                this.videoAd.load();
            }
        }
        showVideo(cb) {
            this.videoCallback = cb;
            if (!Laya.Browser.onWeiXin) {
                this.videoCallback();
                return;
            }
            if (this.videoIsError) {
                ShareMgr.instance.shareGame(cb);
                this.loadVideo();
                return;
            }
            if (this.videoLoaded == false) {
                WxApi.OpenAlert('视频正在加载中！');
                return;
            }
            if (this.videoAd) {
                this.videoAd.offClose();
            }
            Laya.SoundManager.muted = true;
            this.videoAd.onClose(res => {
                if (res && res.isEnded || res === undefined) {
                    console.log('正常播放结束，可以下发游戏奖励');
                    this.videoCallback();
                }
                else {
                    console.log('播放中途退出，不下发游戏奖励');
                }
                Laya.SoundManager.muted = false;
                this.videoLoaded = false;
                this.loadVideo();
            });
            this.videoAd.show();
        }
    }

    class ShareMgr {
        constructor() {
            this.path = '';
            this.picCount = 3;
            this.preT = 0;
            this.shareTips = [
                '请分享到活跃的群！',
                '请分享到不同群！',
                '请分享给好友！',
                '请分享给20人以上的群！'
            ];
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new ShareMgr();
            }
            return this._instance;
        }
        initShare() {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.showShareMenu({
                    withShareTicket: true,
                });
                let dir = '';
                let content = '';
                Laya.Browser.window.wx.onShareAppMessage(function (res) {
                    return {
                        title: content,
                        imageUrl: dir,
                    };
                });
                Laya.Browser.window.wx.onShow((para) => {
                    SoundMgr.instance.playMusic('bgm.mp3');
                    if (WxApi.shareCallback) {
                        let t = new Date().getTime();
                        let diff = t - WxApi.shareTime;
                        if (diff / 1000 >= 3 && !WxApi.firstShare) {
                            WxApi.shareCallback();
                            WxApi.front_share_number--;
                            Laya.Browser.window.wx.showToast({
                                title: '分享成功',
                                icon: 'none',
                                duration: 2000
                            });
                            WxApi.shareCallback = null;
                        }
                        else {
                            WxApi.firstShare = false;
                            Laya.Browser.window.wx.showModal({
                                title: '提示',
                                content: this.shareTips[Math.floor(Math.random() * this.shareTips.length)],
                                confirmText: '重新分享',
                                success(res) {
                                    if (res.confirm) {
                                        console.log('用户点击确定');
                                        ShareMgr.instance.shareGame(WxApi.shareCallback);
                                    }
                                    else if (res.cancel) {
                                        console.log('用户点击取消');
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        shareGame(cb) {
            if (WxApi.front_share_number <= 0) {
                AdMgr.instance.showVideo(cb);
                return;
            }
            WxApi.shareCallback = cb;
            if (!Laya.Browser.onWeiXin) {
                cb();
                return;
            }
            WxApi.shareTime = new Date().getTime();
            let dir = '';
            let content = '';
            Laya.Browser.window.wx.shareAppMessage({
                title: content,
                imageUrl: dir
            });
        }
    }

    class GameLogicCrl {
        constructor() {
            this._gradeScene = null;
            this._Cat = null;
            this._MouseNode = null;
            this._starNode = null;
            this.currentCollNode = null;
            this.currentPointsNode = null;
            this.currentPosNode = null;
            this.validPointArr = [];
            this.propNode = null;
            this.collPoints = [];
            this.cheeseId = -1;
            this.countForWin = 10;
            this.isVictory = false;
            this.isDefeat = false;
            this.isOver = false;
            localStorage.clear();
            GameLogicCrl.Share = this;
            ShareMgr.instance.initShare();
            PlayerDataMgr.getPlayerData();
            new TimeCountMgr();
            Laya.Scene.open('MyScenes/LoadingUI.scene');
        }
        initScene() {
            Laya.Scene3D.load(WxApi.UnityPath + 'Scene1.ls', Laya.Handler.create(this, this.onLoadScene));
        }
        onLoadScene(scene) {
            this._scene = Laya.stage.addChild(scene);
            Laya.stage.setChildIndex(this._scene, 0);
            this._camera = this._scene.getChildByName('Main Camera');
            this._light = this._scene.getChildByName('Directional Light');
            this._starNode = this._scene.getChildByName('AStarNode');
            AStar.initAStar();
            this.createGameScene();
            for (let i = 0; i < this._starNode.numChildren; i++) {
                let s = this._starNode.getChildAt(i);
                s.addComponent(StarPoint);
            }
        }
        createGameScene() {
            let curGid = 4;
            let sceneRes = Laya.loader.getRes(WxApi.UnityPath + 'Scene' + curGid + '.lh');
            this._gradeScene = Laya.Sprite3D.instantiate(sceneRes, this._scene, false, new Laya.Vector3(0, 0, 0));
            this._Cat = this._gradeScene.getChildByName('Cat');
            this._MouseNode = this._gradeScene.getChildByName('MouseNode');
            this.currentCollNode = this._gradeScene.getChildByName('CollNode');
            this.currentPointsNode = this._gradeScene.getChildByName('PointNode');
            this.currentPosNode = this._gradeScene.getChildByName('PosNode');
            this.propNode = this._gradeScene.getChildByName('PropNode');
            for (let i = 0; i < this.currentCollNode.numChildren; i++) {
                let pn = this.currentCollNode.getChildAt(i).getChildByName('PointNode');
                for (let j = 0; j < pn.numChildren; j++) {
                    this.collPoints.push(pn.getChildAt(j));
                }
            }
            this.addCollComponents();
            this.addPropComponents();
            this.countForWin = this._MouseNode.numChildren - 3;
            for (let i = 0; i < this._MouseNode.numChildren; i++) {
                let mouse = this._MouseNode.getChildAt(i);
                mouse.addComponent(Mouse);
            }
            if (this._Cat)
                this._Cat.addComponent(Cat);
        }
        addCollComponents() {
            for (let i = 0; i < this.currentCollNode.numChildren; i++) {
                let coll = this.currentCollNode.getChildAt(i);
                coll.addComponent(Capsule);
            }
        }
        addPropComponents() {
            if (this.propNode.getChildByName('Cheese')) {
                let c = this.propNode.getChildByName('Cheese');
                c.addComponent(Cheese);
                if (c.numChildren > 0) {
                    this.cheeseId = parseInt(c.getChildAt(0).name);
                }
            }
            if (this.propNode.getChildByName('Clip')) {
                let c = this.propNode.getChildByName('Clip');
                c.addComponent(Clip);
            }
        }
        getPropByName(name) {
            return this.propNode.getChildByName(name);
        }
        checkStarPointIsColl() {
            for (let i = 0; i < this._starNode.numChildren; i++) {
                this._starNode.getChildAt(i).getComponent(StarPoint).checkIsColl();
            }
        }
        mouseIsCaught(mouse) {
            mouse.destroy();
            if (this._MouseNode.numChildren < this.countForWin) {
                this.gameOverCallback();
            }
        }
        mouseMove() {
            for (let i = 0; i < this._MouseNode.numChildren; i++) {
                let mCrl = this._MouseNode.getChildAt(i).getComponent(Mouse);
                mCrl.findWayPoint(4);
            }
        }
        winCallback() {
            if (this.isVictory)
                return;
            this.isVictory = true;
            this.isOver = true;
            Laya.Scene.open('MyScenes/VictoryUI.scene');
        }
        gameOverCallback() {
            if (this.isDefeat)
                return;
            this.isDefeat = true;
            this.isOver = true;
            Laya.Scene.open('MyScenes/DefeatUI.scene');
        }
        restartGame() {
            this.isVictory = false;
            this.isDefeat = false;
            this.isOver = false;
            this._gradeScene.removeChildren();
            this._gradeScene.removeSelf();
            this._gradeScene = null;
            this.collPoints = [];
            for (let i = 0; i < this._starNode.numChildren; i++) {
                this._starNode.getChildAt(i).getComponent(StarPoint).destroy();
                let c = this._starNode.getChildAt(i).addComponent(StarPoint);
            }
            AStar.initAStar();
            this.createGameScene();
            this.checkStarPointIsColl();
        }
    }

    class DefeatUI extends Laya.Scene {
        constructor() {
            super();
            this.gradeNum = this['gradeNum'];
            this.gradeBar = this['gradeBar'];
            this.tipsBtn = this['tipsBtn'];
            this.noBtn = this['noBtn'];
        }
        onOpened() {
            this.tipsBtn.on(Laya.Event.CLICK, this, this.tipsBtnCB);
            this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB);
        }
        onClosed() {
        }
        tipsBtnCB() {
        }
        noBtnCB() {
            Laya.Scene.open('MyScenes/StartUI.scene');
            GameLogicCrl.Share.restartGame();
        }
    }

    class FixNodeY extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            let myOwner = this.owner;
            myOwner.y = myOwner.y * Laya.stage.displayHeight / 1334;
        }
    }

    class GameUI extends Laya.Scene {
        constructor() {
            super();
            this.selectColl = null;
            this.collMoveDir = new Laya.Vector3(0, 0, 0);
            this.prePos = new Laya.Vector2(0, 0);
            this.touchPanel = this['touchPanel'];
            this.gradeNum = this['gradeNums'];
        }
        onOpened(param) {
            this.initData();
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        initData() {
            this.touchPanel.on(Laya.Event.MOUSE_DOWN, this, this.touchStart);
            this.touchPanel.on(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.touchPanel.on(Laya.Event.MOUSE_UP, this, this.touchEnd);
            this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString();
        }
        touchStart(event) {
            let pos = new Laya.Vector2(event.stageX, event.stageY);
            let hitResult = new Laya.HitResult();
            let ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            GameLogicCrl.Share._camera.viewportPointToRay(pos, ray);
            GameLogicCrl.Share._scene.physicsSimulation.rayCast(ray, hitResult);
            if (hitResult.succeeded && hitResult.collider.owner.name == 'Coll') {
                let torus = hitResult.collider.owner.parent;
                torus.getComponent(Capsule).clicked();
                GameLogicCrl.Share.checkStarPointIsColl();
                GameLogicCrl.Share.mouseMove();
            }
        }
        touchMove(event) {
        }
        touchEnd(event) {
        }
    }

    class LoadingUI extends Laya.Scene {
        constructor() {
            super();
            this.bar = this['bar'];
            this.cheese = this['cheese'];
            this.perNum = this['perNum'];
        }
        onOpened() {
            if (Laya.Browser.onWeiXin) {
                this.loadSubpackage();
            }
            else {
                this.loadRes();
            }
        }
        onClosed() {
        }
        loadSubpackage() {
            const loadTask = Laya.Browser.window.wx.loadSubpackage({
                name: 'unity',
                success: (res) => {
                    this.loadRes();
                },
                fail: (res) => {
                    this.loadSubpackage();
                }
            });
            loadTask.onProgressUpdate(res => {
                console.log('下载进度', res.progress);
                console.log('已经下载的数据长度', res.totalBytesWritten);
                console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite);
                this.perNum.value = Math.floor(res.progress / 2) + '%';
                this.bar.width = 300 * (res.progress / 50);
                this.cheese.x = 75 + this.bar.width;
            });
        }
        loadRes() {
            var resUrl = [
                WxApi.UnityPath + 'Scene1.lh',
                WxApi.UnityPath + 'Scene2.lh',
                WxApi.UnityPath + 'Scene3.lh',
                WxApi.UnityPath + 'Scene4.lh',
                WxApi.UnityPath + 'Scene5.lh',
                WxApi.UnityPath + 'Scene6.lh'
            ];
            Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
        }
        onComplete() {
            Laya.Scene.open('MyScenes/StartUI.scene');
            GameLogicCrl.Share.initScene();
        }
        onProgress(value) {
            this.bar.width = 300 + 300 * value;
            this.perNum.value = (50 + Math.floor(value * 50)).toString() + '%';
            this.cheese.x = 75 + this.bar.width;
        }
    }

    class PowerUI extends Laya.Scene {
        constructor() {
            super();
            this.closeBtn = this['closeBtn'];
            this.getPowerBtn = this['getPowerBtn'];
        }
        onOpened() {
            this.getPowerBtn.on(Laya.Event.CLICK, this, this.getPowerBtnCB);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
        }
        onClosed() {
        }
        getPowerBtnCB() {
            let cb = () => {
                PlayerDataMgr.getPower(5);
                this.closeBtnCB();
            };
            ShareMgr.instance.shareGame(cb);
        }
        closeBtnCB() {
            this.close();
        }
    }

    class SkinUI extends Laya.Scene {
        constructor() {
            super();
            this.topBg = this['topBg'];
            this.bgPic = this['bgPic'];
            this.backBtn = this['backBtn'];
            this.skinPic = this['skinPic'];
            this.coinNum = this['coinNum'];
            this.skinNode = this['skinNode'];
            this.unlockBtn = this['unlockBtn'];
            this.unlockNum = this['unlockNum'];
            this.chosenId = -1;
        }
        onOpened() {
            Laya.timer.frameLoop(1, this, this.undateCB);
            this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB);
            this.unlockBtn.on(Laya.Event.CLICK, this, this.unlockBtnCB);
            this.skinPic.skin = 'pfsy/pfsy_pf/m_' + (PlayerDataMgr.getPlayerData().playerId + 1) + '.png';
            this.topBg.y = this.bgPic.y - this.topBg.height;
            this.initItems();
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        initItems() {
            for (let i = 0; i < this.skinNode.numChildren; i++) {
                let item = this.skinNode.getChildAt(i);
                let bg = item.getChildByName('bg');
                let pic = item.getChildByName('pic');
                let tick = item.getChildByName('tick');
                tick.visible = false;
                if (PlayerDataMgr.getPlayerData().playerId == i) {
                    bg.skin = 'pfk/pfk_ysz.png';
                    tick.visible = true;
                }
                else if (PlayerDataMgr.getPlayerData().playerArr[i] == 1) {
                    bg.skin = 'pfk/pfk_yjs.png';
                }
                else if (PlayerDataMgr.getPlayerData().playerArr[i] == 0) {
                    if (i == this.chosenId) {
                        bg.skin = 'pfk/pfk_xzjs.png';
                    }
                    else {
                        bg.skin = 'pfk/pfk_wjs.png';
                    }
                }
                pic.skin = 'pfsy/pfsy_pf/m_' + (i + 1) + '.png';
                pic.visible = PlayerDataMgr.getPlayerData().playerArr[i] == 1;
                item.off(Laya.Event.CLICK, this, this.itemCB);
                item.on(Laya.Event.CLICK, this, this.itemCB, [i]);
            }
        }
        itemCB(id) {
            this.chosenId = -1;
            if (PlayerDataMgr.getPlayerData().playerId == id)
                return;
            if (PlayerDataMgr.getPlayerData().playerArr[id] == 1) {
                PlayerDataMgr.getPlayerData().playerId = id;
            }
            else if (PlayerDataMgr.getPlayerData().playerArr[id] == 0) {
                this.chosenId = id;
            }
            this.initItems();
        }
        undateCB() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
        }
        unlockBtnCB() {
        }
        backBtnCB() {
            Laya.Scene.open('MyScenes/StartUI.scene');
        }
    }

    class StartUI extends Laya.Scene {
        constructor() {
            super();
            this.powerNum = this['powerNum'];
            this.coinNum = this['coinNum'];
            this.gradeNum = this['gradeNum'];
            this.gradeBar = this['gradeBar'];
            this.powerTime = this['powerTime'];
            this.startBtn = this['startBtn'];
            this.signBtn = this['signBtn'];
            this.skinBtn = this['skinBtn'];
        }
        onOpened(param) {
            this.startBtn.on(Laya.Event.CLICK, this, this.startBtnCB);
            this.signBtn.on(Laya.Event.CLICK, this, this.signBtnCB);
            this.skinBtn.on(Laya.Event.CLICK, this, this.skinBtnCB);
            this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString();
            Laya.timer.frameLoop(1, this, this.updateCB);
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        startBtnCB() {
            if (PlayerDataMgr.getPlayerData().power <= 0) {
                Laya.Scene.open('MyScenes/PowerUI.scene', false);
                return;
            }
            PlayerDataMgr.decPower();
            Laya.Scene.open('MyScenes/GameUI.scene');
        }
        signBtnCB() {
        }
        skinBtnCB() {
            Laya.Scene.open('MyScenes/SkinUI.scene');
        }
        updateCB() {
            this.calculatePowerTime();
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
        }
        calculatePowerTime() {
            let t = TimeCountMgr.Share.tCount;
            let m = Math.floor(t / 60);
            let s = Math.floor(t - m * 60);
            this.powerTime.text = m.toString() + ':' + s.toString();
            this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString();
            this.powerTime.visible = PlayerDataMgr.getPlayerData().power < PlayerDataMgr.powerMax;
        }
    }

    class VictoryUI extends Laya.Scene {
        constructor() {
            super();
            this.noBounes = this['noBounes'];
            this.bounesNode = this['bounesNode'];
            this.gradeNum = this['gradeNum'];
            this.gradeBar = this['gradeBar'];
            this.coinNum = this['coinNum'];
            this.nextBtn = this['nextBtn'];
            this.gradeNum1 = this['gradeNum1'];
            this.skinPic = this['skinPic'];
            this.getSkinBtn = this['getSkinBtn'];
            this.noBtn = this['noBtn'];
        }
        onOpened() {
            this.nextBtn.on(Laya.Event.CLICK, this, this.nextBtnCB);
            this.getSkinBtn.on(Laya.Event.CLICK, this, this.getSkinBtnCB);
            this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB);
        }
        onClosed() {
        }
        nextBtnCB() {
            this.updateGrade();
            Laya.Scene.open('MyScenes/StartUI.scene');
            GameLogicCrl.Share.restartGame();
        }
        getSkinBtnCB() {
        }
        noBtnCB() {
            this.updateGrade();
            Laya.Scene.open('MyScenes/StartUI.scene');
            GameLogicCrl.Share.restartGame();
        }
        updateGrade() {
            PlayerDataMgr.getPlayerData().grade++;
            if (PlayerDataMgr.getPlayerData().grade > 5) {
                PlayerDataMgr.getPlayerData().grade = 1;
            }
            PlayerDataMgr.setPlayerData();
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("View/DefeatUI.ts", DefeatUI);
            reg("Libs/FixNodeY.ts", FixNodeY);
            reg("View/GameUI.ts", GameUI);
            reg("View/LoadingUI.ts", LoadingUI);
            reg("View/PowerUI.ts", PowerUI);
            reg("View/SkinUI.ts", SkinUI);
            reg("View/StartUI.ts", StartUI);
            reg("View/VictoryUI.ts", VictoryUI);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "MyScenes/DefeatUI.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            new GameLogicCrl();
        }
    }
    new Main();

}());
