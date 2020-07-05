/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import DefeatUI from "./View/DefeatUI"
import FixNodeY from "./Libs/FixNodeY"
import GameUI from "./View/GameUI"
import LoadingUI from "./View/LoadingUI"
import PowerUI from "./View/PowerUI"
import SkinUI from "./View/SkinUI"
import StartUI from "./View/StartUI"
import VictoryUI from "./View/VictoryUI"
/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=750;
    static height:number=1334;
    static scaleMode:string="fixedwidth";
    static screenMode:string="vertical";
    static alignV:string="middle";
    static alignH:string="center";
    static startScene:any="MyScenes/DefeatUI.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=true;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    constructor(){}
    static init(){
        var reg: Function = Laya.ClassUtils.regClass;
        reg("View/DefeatUI.ts",DefeatUI);
        reg("Libs/FixNodeY.ts",FixNodeY);
        reg("View/GameUI.ts",GameUI);
        reg("View/LoadingUI.ts",LoadingUI);
        reg("View/PowerUI.ts",PowerUI);
        reg("View/SkinUI.ts",SkinUI);
        reg("View/StartUI.ts",StartUI);
        reg("View/VictoryUI.ts",VictoryUI);
    }
}
GameConfig.init();