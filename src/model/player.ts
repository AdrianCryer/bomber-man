import shortUUID from "short-uuid";
import Position from "../util/Position";
import Match from "./match";
import MovableActor from "./movable-actor";
import { Direction, StatsConfig } from "./types";

export default class Player extends MovableActor {

    wantsToPlaceBomb: boolean;
    bombCount: number;
    stats: StatsConfig;

    constructor(id: string, initialPosition: Position, stats: StatsConfig) {

        super(id, initialPosition, stats.speed);
        this.id = id;
        this.wantsToMove = false;
        this.inTransition = false;
        this.moveTransitionPercent = 0;
        this.position = initialPosition.clone();
        this.stats = stats;
        this.bombCount = stats.bombCount;
    }

    tick(match: Match, time: number) {
        super.tick(match, time);

        if (this.wantsToPlaceBomb) {
            const position = this.position.round();
            const bomb = {
                id: shortUUID.generate(),
                owner: this,
                position,
                explosionDuration: this.stats['explosionDuration'],
                explosionRadius: this.stats['explosionRadius'],
                timer: this.stats['bombTimer'],
                isSliding: false,
                power: 1,
                slidingSpeed: 5,
                timePlaced: match.time
            };
            match.bombs.push(bomb);
            this.wantsToPlaceBomb = false;
        }
    }

    placeBomb() {
        this.wantsToPlaceBomb = true;
    }
}