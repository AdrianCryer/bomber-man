import * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import GameMap, { CellType } from "./game-map";
import Player, { Bomb, Direction } from "./player";
import { Position } from "./types";
export declare type GameSettings = {
    map: GameMap;
    bots: number;
    difficulty: 'easy' | 'medium' | 'hard';
    initialSpeed: number;
    speedCap: number;
    tickrate: number;
    brickSpawnPercentage: number;
};
declare type Explosion = {
    graphic: Graphics;
    addedToCanvas: boolean;
    center: Position;
    radius: number;
    duration: number;
    timeCreated: number;
    affectedCells: Position[];
};
declare type GameCell = {
    graphic: PIXI.Sprite;
    type: CellType;
};
export default class Game {
    settings: GameSettings;
    app: PIXI.Application;
    explosions: Explosion[];
    players: Player[];
    cells: GameCell[][];
    time: number;
    constructor(app: PIXI.Application, settings: GameSettings);
    private loadMap;
    private spawnBricks;
    private renderCell;
    private renderGrid;
    renderPlayers(initialPass?: boolean): void;
    renderBomb(bomb: Bomb): void;
    private renderExplosionAtCell;
    renderExplosion(explosion: Explosion): void;
    getCellsAffectedByExplosion(centre: Position, radius: number): Position[];
    handleExplosion(explosion: Explosion): void;
    start(): void;
    isBlocked(position: Position): boolean;
    getNextCell(position: Position, direction: Direction): Position;
    canMove(player: Player): boolean;
    fixedUpdate(time: number): void;
    loop(): void;
}
export {};
