import GameMap from "../game-map";

export type MatchSettings = {
    minPlayers: number;
    maxPlayers: number;
};

export default abstract class Match {

    settings: MatchSettings;
    playerIds: string[];
    inMatch: boolean;
    maps: Record<string, GameMap>;
    onGameOverFunction: () => void;
 
    constructor(settings: MatchSettings, playerIds: string[], loadedMaps: Record<string, GameMap>) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.maps = loadedMaps;
        this.inMatch = false;
        this.onGameOver = null;

        if (settings.minPlayers > playerIds.length || playerIds.length >= settings.maxPlayers) {
            throw new Error("Cannot start match with, invalid number of players");
        }
    }

    onGameOver(fn: () => void): void {
        this.onGameOverFunction = fn;
    }
    
    abstract isGameOver(): boolean;

    abstract onUpdate(time: number): void;

    start() {
        this.inMatch = true;
    }
}