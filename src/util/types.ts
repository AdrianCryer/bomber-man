import * as PIXI from "pixi.js";

export type Resources = PIXI.utils.Dict<PIXI.LoaderResource>;

export enum Direction {
    UP = 0,
    LEFT = 1,
    DOWN = 2,
    RIGHT = 3,
};

export type Size = { width: number; height: number };

export class Position {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    round(): Position {
        return new Position(Math.round(this.x), Math.round(this.y));
    }

    static equals(a: Position, b: Position) {
        return a.x === b.x && a.y === b.y;
    }

    clone(): Position {
        return new Position(this.x, this.y);
    }

    getNextPosition(direction: Direction, delta: number = 1): Position {
        let nextPos = this.clone();
        if (direction === Direction.UP) {
            nextPos.y -= delta;
        } else if (direction === Direction.DOWN) {
            nextPos.y += delta;
        } else if (direction === Direction.LEFT) {
            nextPos.x -= delta;
        } else if (direction === Direction.RIGHT) {
            nextPos.x += delta;
        }
        return nextPos;
    }
}