import GameMap from "../game-map";
import Room, { RoomSettings } from "../room";
import Match, { MatchSettings } from "./match";

const DEFAULT_VERSUS_SETTINGS: Omit<RoomSettings, 'map'> = {
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

export default class VersusMatch extends Match {

    room: Room;
    roomSettings: RoomSettings;

    constructor(
        settings: MatchSettings, 
        playerIds: string[], 
        loadedMaps: Record<string, GameMap>, 
        roomSettings?: RoomSettings
    ) {
        super(settings, playerIds, loadedMaps);
        this.roomSettings = roomSettings || {
            map: this.maps['retro'],
            ...DEFAULT_VERSUS_SETTINGS
        };
    }

    start(): void {
        this.room = new Room(this.roomSettings, this.playerIds);
    }

    setSettings(roomSettings: RoomSettings) {
        this.roomSettings = roomSettings;
    }

    onUpdate(time: number): void {
        this.room.mutate(time);
        if (this.isGameOver()) {
            this.onGameOverFunction();
        }
    }

    isGameOver(): boolean {
        return this.room.getPlayers().every(p => !p.isAlive);
    }
}