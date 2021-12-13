import Match from "../match";
import { Direction } from "../types";
import Entity, { Behaviour } from "../entity";


export class Movement implements Behaviour {

    static readonly tag = "movable";

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
            const nextPos = match.getNextPosition(entity.position, this.movingDirection);
            if (!match.positionIsBlocked(nextPos)) {

                let canMove = true;
                const bombs = match.getBombsInPosition(nextPos);
                // slidableEntities = getEntitiesWithBehaviour(IBehaviour)
                // Position contains bomb: can only move if can slide bomb

                if (bombs.length > 0) {
                    const bombNextPos = match.getNextPosition(nextPos, this.movingDirection);
                    canMove = match.positionIsTraversable(bombNextPos);

                    if (canMove) {
                        for (let bomb of bombs) {
                            bomb.isSliding = true;
                            bomb.slidingDirection = this.movingDirection;
                        }
                    }
                }

                if (canMove) {
                    this.moveTransitionPercent = 0;
                    this.moveTransitionDirection = this.movingDirection;
                    this.inTransition = true;
                }
            }
        }

        if (this.inTransition) {
            const delta = this.speed / match.settings.tickrate;
            this.moveTransitionPercent += delta;
            this.moveTransitionPercent = Math.min(this.moveTransitionPercent, 1);
            entity.position = match.getNextPosition(entity.position, this.moveTransitionDirection, delta);

            if (this.moveTransitionPercent === 1) {
                this.inTransition = false;
                entity.position = entity.position.round();
            }
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

// class Player extends Entity {
    
//     constructor() {
//         super();
//         this.behaviours = [
//             new Movable(),
//             // new PlaceBombs(),
//             // new Killable()
//         ]
//     }

//     onUpdate(match: Match, time: number): void {
//         for (let behaviour of this.behaviours) {
//             behaviour.onUpdate(this, match, time);
//         }
//     }
// }

// const player = new Player();
// console.log(player.getBehaviour(Movable))
// player.getBehaviour(Movable).setMoving(Direction.UP);