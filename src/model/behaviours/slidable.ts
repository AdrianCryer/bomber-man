import { Direction } from "../../util/types";
import Entity, { Behaviour } from "../entities/entity";
import Match from "../room";


export class Slidable implements Behaviour {

    isSliding: boolean;
    slidingSpeed: number;
    slidingDirection: Direction;

    constructor(slidingSpeed: number) {
        this.slidingSpeed = slidingSpeed;
        this.isSliding = false;
    }

    onUpdate(entity: Entity, match: Match, time: number) {

        if (!this.isSliding) {
            return;
        }

        const delta = this.slidingSpeed / match.settings.tickrate;
        const lastPosition = entity.position.clone();
        entity.position = entity.position.getNextPosition(this.slidingDirection, delta);
        const closest = entity.position.round();
        const next = closest.getNextPosition(this.slidingDirection);

        if ((closest.x !== entity.position.x || closest.y !== entity.position.y) &&
            !match.positionIsTraversable(next)) {

            // Force to next cell
            if (Math.abs(entity.position.x - closest.x) <= delta &&
                Math.abs(entity.position.y - closest.y) <= delta) {

                this.isSliding = false;
                entity.position = closest;
            }
        }
        match.updateEntityPosition(entity, lastPosition);
    }
}