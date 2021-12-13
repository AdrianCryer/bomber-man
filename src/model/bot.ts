import Position from "../util/Position";
import { Movement } from "./behaviours/movement";
import Match from "./match";
import Player from "./player";
import { Direction } from "./types";


export default class Bot extends Player {

    private strollDelay: number = 200;
    private lastMove: number = 0;

    onUpdate(match: Match, time: number)  {

        const movement = this.getBehaviour(Movement);

        if (!movement.inTransition && time >= this.lastMove + this.strollDelay) {
            this.lastMove = time;  
            let nextDirection = Math.floor(Math.random() * 4) as Direction;
            this.setMoving(nextDirection);

        }

        super.onUpdate(match, time);
    }

    findNearestBrick() {

    }

    goForPowerup() {

    }

    // For hard bots
    pushBomb() {

    }
}