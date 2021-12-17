import shortUUID from "short-uuid";
import Position from "../../util/Position";
import { Movement } from "../behaviours/movement";
import Entity from "./entity";
import Match from "../match";
import { Direction, StatsConfig } from "../types";
import Bomb from "./bomb";
import Damagable from "../behaviours/damagable";
import Powerup from "./powerup";


export default class Player extends Entity {

    shouldPlaceBomb: boolean;
    bombCount: number;
    stats: StatsConfig;

    constructor(id: string, initialPosition: Position, stats: StatsConfig) {
        super(id, initialPosition.clone(), false);
        this.stats = stats;
        this.bombCount = 0;
        this.shouldPlaceBomb = false;
        this.addBehaviour(new Movement(stats.speed));
        this.addBehaviour(new Damagable(100, false));
    }

    onUpdate(match: Match, time: number) {

        if (!this.isAlive()) {
            return;
        }

        this.getBehaviour(Movement).onUpdate(this, match, time);
        this.getBehaviour(Damagable).onUpdate(this, match, time);

        if (this.shouldPlaceBomb) {
            match.createEntity(new Bomb(
                shortUUID.generate(),
                this.position.round(),
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

        const position = this.position.round();
        for (let entity of match.getEntitiesAtPosition(position)) {
            if (entity instanceof Powerup) {
                const powerup = entity.type;
                this.stats[powerup.stat] += powerup.delta;
                if (powerup.stat === 'speed') {
                    this.getBehaviour(Movement).speed += powerup.delta;
                }
                match.removeEntity(entity);
            }
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

    isAlive() {
        return !this.getBehaviour(Damagable).isDead();
    }
}