import { AnimatedSprite, Graphics, graphicsUtils } from "pixi.js";
import { Position, StatsConfig } from "./types";
import { PlayerController } from "./player-controller";

export enum Direction {
    UP = 0,
    LEFT = 1,
    DOWN = 2,
    RIGHT = 3,
};

type PlayerConfig = {
    position: Position;
    stats: StatsConfig;
};

export type Bomb = {
    graphic: AnimatedSprite;
    addedToCanvas: boolean;
    timePlaced: number;
    timer: number;
    explosionRadius: number;
    explosionDuration: number;
    position: Position;
    isSliding: boolean;
    slidingSpeed: number;
    slidingDirection?: Direction;
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

    stats: StatsConfig;
    isAlive: boolean;

    get controller(): PlayerController {
        return this.playerController
    }

    constructor(id: number, graphic: Graphics, playerController: PlayerController, settings: PlayerConfig) {
        this.id = id;
        this.graphic = graphic;
        this.playerController = playerController;
        this.wantsToMove = false;
        this.inTransition = false;
        this.moveTransitionPercent = 0;
        this.cellPosition = Object.assign({}, settings.position);
        this.position = Object.assign({}, settings.position);
        this.stats = settings.stats;
        this.bombs = [];
        this.bombCount = 0;
    }

    setMoving(direction: Direction) {
        this.movingDirection = direction;
        this.wantsToMove = true;
    }

    placeBomb() {
        this.bombs.push({
            graphic: null,
            position: { x: Math.round(this.position.x), y: Math.round(this.position.y) },
            explosionRadius: this.stats.explosionRadius,
            explosionDuration: this.stats.explosionDuration,
            timePlaced: (new Date()).getTime(),
            timer: this.stats.bombTimer,
            addedToCanvas: false,
            isSliding: false,
            slidingSpeed: 5
        });
        this.bombCount -= 1;
    }
}