import Position from "../util/Position";
import Match from "./match";
import Player from "./player";
import { Direction } from "./types";


export default class MovableActor {
    
    id: string;
    position: Position;
    movingDirection: Direction;
    wantsToMove: boolean;
    inTransition: boolean;
    moveTransitionPercent: number;
    moveTransitionDirection: Direction;
    speed: number;
    isAlive: boolean;

    constructor(id: string, initialPosition: Position, speed: number) {
        this.id = id;
        this.position = initialPosition;
        this.speed = speed;
        this.isAlive = true;
    }

    tick(match: Match, time: number) {

        if (!this.isAlive) {
            return;
        }

        if (!this.inTransition && this.wantsToMove) {
            const nextPos = match.getNextPosition(this.position, this.movingDirection);
            if (!match.positionIsBlocked(nextPos)) {

                let canMove = true;
                const bombs = match.getBombsInPosition(nextPos);

                // Position contains bomb: can only move if can slide bomb
                if (bombs.length > 0) {
                    const bombNextPos = match.getNextPosition(nextPos,this. movingDirection);
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
            this.position = match.getNextPosition(this.position, this.moveTransitionDirection, delta);

            if (this.moveTransitionPercent === 1) {
                this.inTransition = false;
                this.position = this.position.round();
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