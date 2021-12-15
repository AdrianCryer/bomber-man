import Entity, { Behaviour } from "../entities/entity";
import Match from "../match";
import { Direction } from "../types";


export class Slidable implements Behaviour {

    slidingSpeed: number;
    slidingDirection: Direction;

    constructor(slidingSpeed: number) {
        this.slidingSpeed = slidingSpeed;
    }

    onUpdate(entity: Entity, match: Match, time: number) {

    }
}