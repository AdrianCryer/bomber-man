import * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import GameMap from "./game-map";

export type Resources = PIXI.utils.Dict<PIXI.LoaderResource>;

export type Position = { x: number; y: number };

export type Size = { width: number; height: number };

export type StatsConfig = {
    // Blocks per second
    speed: number;

    // How many blocks an explosion will travel
    explosionRadius: number;

    // Number of seconds an explosion will last
    explosionDuration: number;

    // Number of bombs the player can place at any given time
    bombCount: number;

    // Numer of seconds before bomb will detonate
    bombTimer: number;
};

export type StatType = keyof StatsConfig;

export type PowerUp = {
    type: StatType;
    
}

export type GameSettings = {

    // The map to play
    map: GameMap;

    // Number of bots in the game
    bots: number;

    // Bot difficulty
    difficulty: 'easy' | 'medium' | 'hard';

    // Tickrate to preform fixed updates (i.e., movement)
    tickrate: number;

    // Percentage of brick spawns
    brickSpawnPercentage: number;

    // Permitted settings
    statsSettings: {
        [key in StatType]: { min: number, max: number }
    },

    // Settings of all of the starting players
    detaultStats: StatsConfig,

    statusBoard?: {
        alignment: 'left' | 'right';
        splitRatio: number;
    };
};
