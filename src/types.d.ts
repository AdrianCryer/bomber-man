import { Graphics } from "pixi.js";
import GameMap from "./game-map";

export type Position = { x: number; y: number };

export type Size = { width: number; height: number };

export enum PowerUpType {
    SPEED = 'speed',
    EXPLOSION_RADIUS = 'radius',
    EXPLOSION_SPEED = 'explosion_speed',
    BOMB_COUNT = 'bomb_count'
}

export interface PowerUp {
    graphic: Graphics;
    type: PowerUpType;
    tier: number;
}

export type PowerUpConfig = {

};

export type GameSettings = {

    // The map to play
    map: GameMap;

    // Number of bots in the game
    bots: number;

    // Bot difficulty
    difficulty: 'easy' | 'medium' | 'hard';

    // Starting speed of all players
    initialSpeed: number;

    // Blocks per second
    speedCap: number;

    // Tickrate to preform fixed updates (i.e., movement)
    tickrate: number;

    // Percentage of brick spawns
    brickSpawnPercentage: number;

    // powerups: { [type: PowerUpType]: PowerUpConfig}
};
