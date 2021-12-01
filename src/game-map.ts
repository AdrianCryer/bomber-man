export type MapProperties = {
    height: number;
    width: number;
};

export enum CellType {
    BRICK = "BRICK",
    SPAWN = "SPAWN",
    OPEN = "OPEN",
    SOLID = "SOLID"
};

export default class GameMap {

    private _props: MapProperties;

    grid: CellType[][];
    _startingPositions: { x: number; y: number }[];

    constructor(props: MapProperties) {
        this._props = props;
        this.grid = [];
        for (let i = 0; i < props.height; i++) {
            this.grid[i] = new Array(props.width);
        }
        this._startingPositions = [];
    }

    
    public get startingPositions(): { x: number; y: number }[] {
        return this._startingPositions
    }

    public get props(): MapProperties {
        return this._props;
    }

    static loadFromFile(fileContents: string): GameMap {

        const rows = fileContents.split("\n").map(row => row.trim());
        const map = new GameMap({
            height: rows.length,
            width: rows[0].split(" ").length
        });
        for (let [i, row] of rows.entries()) {
            for (let [j, cell] of row.split(" ").entries()) {
                let type: CellType = CellType.SOLID;
                switch (cell) {
                    case 'o':
                        type = CellType.OPEN;
                        break;
                    case 'x':
                        type = CellType.SPAWN;
                        map.startingPositions.push({ y: i, x: j });
                        break;
                }
                map.updateCell(i, j, type);
            }
        }
        return map;
    }

    static async loadMapFile(filePath: string): Promise<string> {
        const response = await fetch(filePath);
        return await response.text();
    }

    getCell(row: number, col: number): CellType {
        return this.grid[row][col];
    }

    updateCell(row: number, col: number, type: CellType) {
        this.grid[row][col] = type;
    }
}