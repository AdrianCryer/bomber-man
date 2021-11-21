export declare type MapProperties = {
    height: number;
    width: number;
};
export declare enum CellType {
    BRICK = "BRICK",
    SPAWN = "SPAWN",
    OPEN = "OPEN",
    SOLID = "SOLID"
}
export default class GameMap {
    private _props;
    grid: CellType[][];
    _startingPositions: {
        x: number;
        y: number;
    }[];
    constructor(props: MapProperties);
    get startingPositions(): {
        x: number;
        y: number;
    }[];
    get props(): MapProperties;
    static loadFromFile(fileContents: string): GameMap;
    static loadMapFile(filePath: string): Promise<string>;
    getCell(row: number, col: number): CellType;
    updateCell(row: number, col: number, type: CellType): void;
}
