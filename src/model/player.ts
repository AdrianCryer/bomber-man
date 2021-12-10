import { Direction, Position, StatsConfig } from "./types";

type PlayerConfig = {
    initialPosition: Position;
    stats: StatsConfig;
};

export default class Player {
    id: string;
    position: Position;
    movingDirection: Direction;
    wantsToMove: boolean;
    inTransition: boolean;
    moveTransitionPercent: number;
    moveTransitionDirection: Direction;
    bombCount: number;
    stats: StatsConfig;
    isAlive: boolean;

    constructor(id: string, { initialPosition, stats }: PlayerConfig) {
        this.id = id;
        this.wantsToMove = false;
        this.inTransition = false;
        this.moveTransitionPercent = 0;
        this.position = Object.assign({}, initialPosition);
        this.stats = stats;
        this.bombCount = stats.bombCount;
    }

    getNearestPosition() {
        return {
            x: Math.round(this.position.x),
            y: Math.round(this.position.y),
        }
    }

    setMoving(direction: Direction) {
        this.movingDirection = direction;
        this.wantsToMove = true;
    }
}