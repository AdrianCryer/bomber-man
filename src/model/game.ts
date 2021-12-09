import GameMap from "./game-map";
import Match, { MatchSettings } from "./match";

export type GameSettings = {};

const LEVELS = {};

export default class Game {

    settings: GameSettings;
    inMatch: boolean;
    currentMatch: Match;
    maps: Record<string, GameMap>;

    constructor(settings: GameSettings) {
        this.settings = settings;
        this.inMatch = false;
        this.maps = {};
    }

    startMatch(matchSettings: MatchSettings) {
        this.inMatch = true;
        this.currentMatch = new Match(matchSettings);
    }

    addMap(name: string, map: GameMap) {
        this.maps[name] = map;
    }

    mutate() {
        if (!this.inMatch) {
            return;
        }
    }
}