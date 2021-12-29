import GameMap from "./game-map";
import Match from "./gamemodes/match";
import VersusMatch from "./gamemodes/versus-match";

export type GameMode = 'versus' | 'levels' | 'rogue';
export type GameSettings = {};

export default class Game {

    settings: GameSettings;
    playerIds: string[];
    hasMatchStarted: boolean;
    currentMatch: Match;
    maps: Record<string, GameMap>;

    constructor(settings: GameSettings, playerIds: string[]) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.hasMatchStarted = false;
        this.maps = {};
    }

    startVersusMatch() {
        this.hasMatchStarted = true;
        this.currentMatch = new VersusMatch(this.playerIds, this.maps);
        this.currentMatch.start();
    }

    startRogueMatch() {

    }

    startLevelsMatch() {

    }

    addMap(name: string, map: GameMap) {
        this.maps[name] = map;
    }

    mutate(time: number) {
        if (!this.hasMatchStarted) {
            return;
        }
        this.currentMatch.onUpdate(time)
    }
}