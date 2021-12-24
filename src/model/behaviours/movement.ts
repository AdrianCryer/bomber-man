import Match from "../match";
import Entity, { Behaviour } from "../entities/entity";
import { Slidable } from "./slidable";
import { Direction } from "../../util/types";


export class Movement implements Behaviour {

    movingDirection: Direction;
    wantsToMove: boolean;
    inTransition: boolean;
    moveTransitionPercent: number;
    moveTransitionDirection: Direction;
    speed: number;

    constructor(speed: number) {
        this.speed = speed;
        this.wantsToMove = false;
        this.inTransition = false;
        this.movingDirection = -1;
        this.moveTransitionDirection = -1;
        this.moveTransitionPercent = 0;
    }

    onUpdate(entity: Entity, match: Match, time: number) {

        if (!this.inTransition && this.wantsToMove) {
            const nextPos = entity.position.getNextPosition(this.movingDirection);
            if (!match.positionIsBlocked(nextPos)) {

                let canMove = true;
                const slidableEntities = match.getEntitiesWithBehaviourAtPosition(Slidable, nextPos);

                if (slidableEntities.length > 0) {
                    const entityNextPos = nextPos.getNextPosition(this.movingDirection);
                    canMove = match.positionIsTraversable(entityNextPos);

                    if (canMove) {
                        for (let entity of slidableEntities) {
                            entity.getBehaviour(Slidable).isSliding = true;
                            entity.getBehaviour(Slidable).slidingDirection = this.movingDirection;
                        }
                    }
                } else {
                    canMove = match.positionIsTraversable(nextPos);
                }

                if (canMove) {
                    this.moveTransitionPercent = 0;
                    this.moveTransitionDirection = this.movingDirection;
                    this.inTransition = true;
                }
            }
        }

        if (this.inTransition) {
            const lastPosition = entity.position.clone();
            const delta = this.speed / match.settings.tickrate;
            this.moveTransitionPercent += delta;
            this.moveTransitionPercent = Math.min(this.moveTransitionPercent, 1);
            entity.position = entity.position.getNextPosition(this.moveTransitionDirection, delta);

            if (this.moveTransitionPercent === 1) {
                this.inTransition = false;
                entity.position = entity.position.round();
            }
            match.updateEntityPosition(entity, lastPosition);
        }
    }

    setMoving(direction: Direction) {
        this.wantsToMove = true;
        this.movingDirection = direction;
    }

    stopMoving(direction: Direction) {
        if (this.wantsToMove && this.movingDirection === direction) {
            this.wantsToMove = false;
        }
    }
}