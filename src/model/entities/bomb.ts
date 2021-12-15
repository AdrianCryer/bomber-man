import Position from "../../util/Position";
import { Slidable } from "../behaviours/slidable";
import match from "../match";
import { Direction } from "../types";
import Entity from "./entity";
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
    
    isSliding: boolean;
    slidingDirection?: Direction;
    bombConfig: BombConfig;

    constructor(id: string, position: Position, bombConfig: BombConfig) {
        super(id, position);
        this.bombConfig = bombConfig;
        this.isSliding = false;
        this.addBehaviour(new Slidable(bombConfig.slidingSpeed));
    }

    onUpdate(match: match, time: number): void {
        this.getBehaviour(Slidable).onUpdate(this, match, time);
    }
}