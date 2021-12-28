import { urlToHttpOptions } from "url";
import GameMap from "./game-map";
import Match, { MatchSettings } from "./match";

export type GameSettings = {};

const DEFAULT_MATCH_SETTINGS: Omit<MatchSettings, 'map'> = {
    bots: 0,
    difficulty: 'easy',
    tickrate: 64,
    brickSpawnChance: 0.3,
    powerupSpawnChance: 1,
    statsSettings: {
        speed: { min: 1, max: 8 },
        explosionRadius: { min: 2, max: 10 },
        explosionDuration: { min: 0.2, max: 1 },
        bombCount: { min: 1, max: 5 },
        bombTimer: { min: 0.2, max: 5 }
    },
    detaultStats: {
        speed: 3,
        explosionDuration: 0.5,
        explosionRadius: 4,
        bombCount: 1,
        bombTimer: 3
    },
    powerups: [
        { name: 'Speed Up', stat: 'speed', delta: 1, rarity: 1 },
        { name: 'Bomb range up', stat: 'explosionRadius', delta: 1, rarity: 1 },
        { name: 'Big bombs', stat: 'explosionRadius', delta: 3, rarity: 2 }
    ],
    powerupRarityStepFunction: (maxRarity: number, val: number) => {
        return Math.floor(maxRarity * val ** 2) + 1;
    }
};

export default class Game {

    settings: GameSettings;
    playerIds: string[];
    inMatch: boolean;
    currentMatch: Match;
    currentLevel: number;
    maps: Record<string, GameMap>;

    constructor(settings: GameSettings, playerIds: string[]) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.inMatch = false;
        this.maps = {};
        this.currentLevel = 1;
    }

    startMatch(matchSettings: MatchSettings) {
        this.inMatch = true;
        this.currentMatch = new Match(matchSettings, this.playerIds);
    }

    startDefaultMatch() {
        this.startMatch({
            map: this.maps['retro'],
            ...DEFAULT_MATCH_SETTINGS
        });
    }

    endCurrentMatch() {
        this.inMatch = false;
        this.currentMatch = null;
    }

    addMap(name: string, map: GameMap) {
        this.maps[name] = map;
    }

    mutate(time: number) {
        if (!this.inMatch) {
            return;
        }
        this.currentMatch.mutate(time)
    }
}