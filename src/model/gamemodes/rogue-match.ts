import GameMap from "../game-map";
import Room, { RoomSettings } from "../room";
import Match from "./match";

const DEFAULT_MATCH_SETTINGS = {
    minPlayers: 1,
    maxPlayers: 1
}

export type RogueMatchSettings = Omit<RoomSettings, 'map' | 'bots'> & {

};

export default class RogueMatch extends Match {

    currentRoom: Room;
    roomSettings: RoomSettings;

    constructor(
        playerIds: string[], 
        loadedMaps: Record<string, GameMap>, 
        gameModeSettings?: RogueMatchSettings
    ) {
        super(DEFAULT_MATCH_SETTINGS, playerIds, loadedMaps);
    }

    generateFloor() {
        
    }

    isGameOver(): boolean {
        return true;
    }
    
    onUpdate(time: number): void {
        throw new Error("Method not implemented.");
    }

    getPlayerControllerBindings(): { [key: string]: (playerId: string, ...args: any) => void; } {
        throw new Error("Method not implemented.");
    }
}