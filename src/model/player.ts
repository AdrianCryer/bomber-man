import Position from "../util/Position";
import { Direction, StatsConfig } from "./types";

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
        this.position = initialPosition.clone();
        this.stats = stats;
        this.bombCount = stats.bombCount;
    }

    setMoving(direction: Direction) {
        this.movingDirection = direction;
        this.wantsToMove = true;
    }
}