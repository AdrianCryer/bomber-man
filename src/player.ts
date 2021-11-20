import { Graphics, graphicsUtils } from "pixi.js";
import { Position } from "./types";
import { PlayerController } from "./player-controller";

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

type PlayerConfiguration = {
    position: Position;
    speed: number;
    bombCount: number;
    bombExplosionRadius: number;
    bombExplosionDuration: number;
    bombTimer: number;
};

export type Bomb = {
    graphic: Graphics;
    addedToCanvas: boolean;
    timePlaced: number;
    timer: number;
    explosionRadius: number;
    explosionDuration: number;
    position: Position;
};


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
    bombs: Bomb[];

    position: Position;
    cellPosition: Position;

    powerups: any;
    speed: number;
    bombExplosionRadius: number;
    bombExplosionDuration: number;
    bombTimer: number;

    isAlive: boolean;

    get controller(): PlayerController {
        return this.playerController
    }

    constructor(id: number, graphic: Graphics, playerController: PlayerController, settings: PlayerConfiguration) {
        this.id = id;
        this.graphic = graphic;
        this.playerController = playerController;
        this.wantsToMove = false;
        this.inTransition = false;
        this.moveTransitionPercent = 0;
        this.cellPosition = Object.assign({}, settings.position);
        this.position = Object.assign({}, settings.position);
        this.speed = settings.speed;
        this.bombCount = settings.bombCount;
        this.bombTimer = settings.bombTimer;
        this.bombExplosionRadius = settings.bombExplosionRadius;
        this.bombExplosionDuration = settings.bombExplosionDuration;
        this.bombs = [];
    }

    setMoving(direction: Direction) {
        this.movingDirection = direction;
        this.wantsToMove = true;
    }

    placeBomb() {

        this.bombs.push({
            graphic: new Graphics(),
            position: { x: Math.round(this.position.x), y: Math.round(this.position.y) },
            explosionRadius: this.bombExplosionRadius,
            explosionDuration: this.bombExplosionDuration,
            timePlaced: (new Date()).getTime(),
            timer: this.bombTimer,
            addedToCanvas: false
        });
        this.bombCount -= 1;
        console.log(this.bombs);
    }
}