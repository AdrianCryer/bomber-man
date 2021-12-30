import GameMap from "./game-map";
import Match from "./gamemodes/match";
import VersusMatch from "./gamemodes/versus-match";

export type GameMode = 'versus' | 'levels' | 'rogue';
export type GameSettings = {
    tickrate: number;
};

export default class Game {

    settings: GameSettings;
    playerIds: string[];
    currentMatch: Match;
    maps: Record<string, GameMap>;

    constructor(settings: GameSettings, playerIds: string[]) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.maps = {};
    }

    initialiseVersusMatch() {
        this.currentMatch = new VersusMatch(this.playerIds, this.maps);
        this.currentMatch.initialise();
    }

    initialiseRogueMatch() {

    }

    initialiseLevelsMatch() {

    }

    isInMatch(): boolean {
        return this.currentMatch !== undefined;
    }

    addMap(name: string, map: GameMap) {
        this.maps[name] = map;
    }

    onUpdate(time: number) {
        if (!this.isInMatch()) {
            return;
        }
        this.currentMatch.onUpdate(time)
    }
}