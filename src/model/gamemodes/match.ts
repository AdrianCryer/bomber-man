import GameMap from "../game-map";

export type MatchSettings = {
    minPlayers: number;
    maxPlayers: number;
};

export default abstract class Match {

    time: number;
    settings: MatchSettings;
    playerIds: string[];
    maps: Record<string, GameMap>;
    onGameOverFunction: () => void;
    
    inMatch: boolean;
 
    constructor(settings: MatchSettings, playerIds: string[], loadedMaps: Record<string, GameMap>) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.maps = loadedMaps;
        this.inMatch = false;
        this.onGameOverFunction = null;

        if (settings.minPlayers > playerIds.length || playerIds.length >= settings.maxPlayers) {
            throw new Error("Cannot start match with, invalid number of players");
        }
    }

    onGameOver(fn: () => void): void {
        this.onGameOverFunction = fn;
    }

    abstract initialise(): void;
    
    abstract isGameOver(): boolean;

    abstract onUpdate(time: number): void;

    abstract getPlayerControllerBindings(): {
        [key: string]: (playerId: string, ...args: any) => void
    };

    start() {
        this.inMatch = true;
    }
}