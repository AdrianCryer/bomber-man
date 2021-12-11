export default class Position {

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
}