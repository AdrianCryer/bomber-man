import { Graphics, graphicsUtils } from "pixi.js";
import { PlayerController } from "./player-controller";

export enum Facing {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

export type Direction = -1 | 0 | 1;

export default class Player {

    id: number;
    graphic: Graphics;
    playerController: PlayerController;
    moving: { x: Direction, y: Direction };
    private _position: { x: number; y: number; };
    powerups: any;
    speed: number;
    explosionRadius: number;
    isAlive: boolean;

    public get position(): { x: number; y: number; } {
        return this._position;
    }

    public set position(value: { x: number; y: number; }) {
        this._position = value;
    }

    get controller(): PlayerController {
        return this.playerController
    }

    constructor(id: number, graphic: Graphics, playerController: PlayerController) {
        this.id = id;
        this.graphic = graphic;
        this.playerController = playerController;
        this.moving = { x: 0, y: 0 };
    }

    setMovingX(direction: Direction) {
        this.moving.x = direction;
    }

    setMovingY(direction: Direction) {
        this.moving.y = direction;
    }
}