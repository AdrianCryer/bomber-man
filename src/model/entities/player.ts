import shortUUID from "short-uuid";
import Position from "../../util/Position";
import { Movement } from "../behaviours/movement";
import Entity from "./entity";
import Match from "../match";
import { Direction, StatsConfig } from "../types";
import Bomb from "./bomb";


export default class Player extends Entity {

    isAlive: boolean;
    shouldPlaceBomb: boolean;
    bombCount: number;
    stats: StatsConfig;

    constructor(id: string, initialPosition: Position, stats: StatsConfig) {
        super(id, initialPosition.clone());
        this.stats = stats;
        this.isAlive = true;
        this.bombCount = 0;
        this.shouldPlaceBomb = false;
        this.addBehaviour(new Movement(stats.speed));
    }

    onUpdate(match: Match, time: number) {

        this.getBehaviour(Movement).onUpdate(this, match, time);

        if (this.shouldPlaceBomb) {
            const position = this.position.round();
            match.createEntity(new Bomb(
                shortUUID.generate(),
                position,
                {
                    owner: this,
                    explosionDuration: this.stats['explosionDuration'],
                    explosionRadius: this.stats['explosionRadius'],
                    timer: this.stats['bombTimer'],
                    power: 1,
                    slidingSpeed: 5,
                    timePlaced: match.time
                }
            ));
            this.shouldPlaceBomb = false;
        }
    }

    setMoving(direction: Direction) {
        this.getBehaviour(Movement).setMoving(direction);
    }

    stopMoving(direction: Direction) {
        this.getBehaviour(Movement).stopMoving(direction);
    }

    placeBomb() {
        this.shouldPlaceBomb = true;
    }
}