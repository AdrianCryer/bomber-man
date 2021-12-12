import Position from "../util/Position";
import Match from "./match";
import MovableActor from "./movable-actor";
import Player from "./player";
import { Direction } from "./types";


export default class Bot extends Player {

    private strollDelay: number = 200;
    private lastMove: number = 0;

    tick(match: Match, time: number)  {

        super.tick(match, time);

        if (!this.inTransition && time >= this.lastMove + this.strollDelay) {
            this.lastMove = time;  
            let nextDirection = Math.floor(Math.random() * 4) as Direction;
            this.setMoving(nextDirection);

        }
    }

    findNearestBrick() {

    }

    goForPowerup() {

    }

    // For hard bots
    pushBomb() {

    }
}