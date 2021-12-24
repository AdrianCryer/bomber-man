import { Position } from "../util/types";

// export type Position = { x: number; y: number };

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

export type PowerUpType = {
    name: string;
    stat: StatType;
    delta: number;
    rarity: number;
};

export type PowerUp = {
    position: Position;
    type: PowerUpType;
};