
export class GameData {
    private static ins: GameData;
    private constructor() { }
    /**
     * 单例
     */
    public static getInstance(): GameData {
        return this.ins ? this.ins : this.ins = new GameData();
    }
    public road:cc.Node;
    public car:any;

}
