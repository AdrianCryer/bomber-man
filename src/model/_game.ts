import { Direction } from "readline";
import { EventEmitter } from "stream";
import GameMap from "./game-map";
import Match, { MatchSettings } from "./match";

export type GameSettings = {};

const LEVELS = {};

// export type GameFragment = Exclude<Game, 'eventEmitter' | 'maps'>;

export default class Game {

    settings: GameSettings;
    inMatch: boolean;
    currentMatch: Match;
    maps: Record<string, GameMap>;

    constructor(settings: GameSettings) {
        this.settings = settings;
    }

    startMatch(matchSettings: MatchSettings) {
        this.inMatch = true;
        this.currentMatch = new Match(matchSettings);
    }

    mutate() {
        if (!this.inMatch) {
            return;
        }
    }
}