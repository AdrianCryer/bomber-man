import { Position } from "../util/types";

export type MapProperties = {
    height: number;
    width: number;
};

export enum CellType {
    SPAWN = "SPAWN",
    OPEN = "OPEN",
    SOLID = "SOLID"
};

export default class GameMap {

    props: MapProperties;
    grid: CellType[][];
    startingPositions: Position[];

    constructor(props: MapProperties) {
        this.props = props;
        this.grid = [];
        for (let i = 0; i < props.height; i++) {
            this.grid[i] = new Array(props.width);
        }
        this.startingPositions = [];
    }

    static loadFromFile(fileContents: string): GameMap {

        const rows = fileContents.split("\n").map(row => row.trim());
        const map = new GameMap({
            height: rows.length,
            width: rows[0].split(" ").length
        });
        for (let [y, row] of rows.entries()) {
            for (let [x, cell] of row.split(" ").entries()) {
                let type: CellType = CellType.SOLID;
                switch (cell) {
                    case 'o':
                        type = CellType.OPEN;
                        break;
                    case 'x':
                        type = CellType.SPAWN;
                        map.startingPositions.push(new Position(x, y));
                        break;
                }
                map.updateCell(y, x, type);
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