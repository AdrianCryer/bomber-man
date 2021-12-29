import shortUUID from "short-uuid";
import { Position } from "../../util/types";
import { Slidable } from "../behaviours/slidable";
import Room from "../room";
import Entity from "./entity";
import Explosion from "./explosion";
import Player from "./player";


export type BombConfig = {
    owner: Player;
    power: number;
    timePlaced: number;
    timer: number;
    explosionRadius: number;
    explosionDuration: number;
    slidingSpeed: number;
}

export default class Bomb extends Entity {
    
    config: BombConfig;

    constructor(id: string, position: Position, config: BombConfig) {
        super(id, position, true);
        this.config = config;
        this.addBehaviour(new Slidable(config.slidingSpeed));
    }

    onUpdate(match: Room, time: number): void {

        if (time < this.config.timePlaced + this.config.timer * 1000) {
            this.getBehaviour(Slidable).onUpdate(this, match, time);
        } else {
            const explosion = new Explosion(
                shortUUID.generate(),
                this.position.round(),
                {
                    intensity: this.config.power,
                    duration: this.config.explosionDuration,
                    radius: this.config.explosionRadius,
                    timeCreated: match.time
                }
            );
            explosion.calculateExplosionCells(match);
            match.createEntity(explosion);
            match.removeEntity(this);
        }
    }
}