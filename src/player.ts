import { Direction, Position, StatsConfig } from "./model/types";

type PlayerConfig = {
    initialPosition: Position;
    stats: StatsConfig;
};

export default class Player {
    id: number;
    movingDirection: Direction;
    wantsToMove: boolean;
    inTransition: boolean;
    moveTransitionPercent: number;
    moveTransitionDirection: Direction;

    bombCount: number;

    position: Position;
    cellPosition: Position;

    stats: StatsConfig;
    isAlive: boolean;

    constructor(id: number, { initialPosition, stats }: PlayerConfig) {
        this.id = id;
        this.wantsToMove = false;
        this.inTransition = false;
        this.moveTransitionPercent = 0;
        this.cellPosition = Object.assign({}, initialPosition);
        this.position = Object.assign({}, initialPosition);
        this.stats = stats;
        this.bombCount = stats.bombCount;
    }

    setMoving(direction: Direction) {
        this.movingDirection = direction;
        this.wantsToMove = true;
    }
}