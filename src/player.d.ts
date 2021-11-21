import { Graphics } from "pixi.js";
import { Position } from "./types";
import { PlayerController } from "./player-controller";
export declare enum Direction {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
}
declare type PlayerConfiguration = {
    position: Position;
    speed: number;
    bombCount: number;
    bombExplosionRadius: number;
    bombExplosionDuration: number;
    bombTimer: number;
};
export declare type Bomb = {
    graphic: Graphics;
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
    powerups: any;
    speed: number;
    bombExplosionRadius: number;
    bombExplosionDuration: number;
    bombTimer: number;
    isAlive: boolean;
    get controller(): PlayerController;
    constructor(id: number, graphic: Graphics, playerController: PlayerController, settings: PlayerConfiguration);
    setMoving(direction: Direction): void;
    placeBomb(): void;
}
export {};
