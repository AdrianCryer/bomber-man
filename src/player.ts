import { Graphics, graphicsUtils } from "pixi.js";
import { Position } from "./types";
import { PlayerController } from "./player-controller";

export enum Direction {
    UP = -1,
    DOWN = 1,
    LEFT,
    RIGHT
};

// export type Direction = -1 | 0 | 1;



// type MoveTransition = {
//     from: Position,
//     to: Position,
//     percentage: number
// }

export default class Player {

    id: number;
    graphic: Graphics;
    playerController: PlayerController;

    movingDirection: Direction;
    wantsToMove: boolean;
    inTransition: boolean;
    moveTransitionPercent: number;
    moveTransitionDirection: Direction;

    bombCount: number;
    bombPlacedCell: Position;

    position: Position;
    cellPosition: Position;

    powerups: any;
    speed: number;
    explosionRadius: number;
    isAlive: boolean;

    get controller(): PlayerController {
        return this.playerController
    }

    constructor(id: number, graphic: Graphics, playerController: PlayerController) {
        this.id = id;
        this.graphic = graphic;
        this.playerController = playerController;
        this.wantsToMove = false;
        this.inTransition = false;
        this.moveTransitionPercent = 0;
    }

    setMoving(direction: Direction) {
        this.movingDirection = direction;
        this.wantsToMove = true;
    }

    placeBomb() {
        this.bombPlacedCell = Object.assign({}, this.cellPosition);
        this.bombCount -= 1;
    }
}