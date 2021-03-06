import { Direction } from "../../util/types";
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

const DEFAULT_MATCH_SETTINGS = {
    minPlayers: 1,
    maxPlayers: 4
}

const COUNTER_DURATION_SECONDS = 5;


export default class VersusMatch extends Match {

    room: Room;
    roomSettings: RoomSettings;

    /** Count down timer */
    countDownActive: boolean;
    countDownTimerStart: number;
    countDownDuration: number;

    constructor(
        playerIds: string[], 
        loadedMaps: Record<string, GameMap>, 
        roomSettings?: RoomSettings
    ) {
        super(DEFAULT_MATCH_SETTINGS, playerIds, loadedMaps);
        this.roomSettings = roomSettings || {
            map: this.maps['retro'],
            ...DEFAULT_VERSUS_SETTINGS
        };
    }

    initialise(): void {
        this.room = new Room(this.roomSettings, this.playerIds);
    }

    start(): void {
        super.start();
        this.startPreGameCountdown(COUNTER_DURATION_SECONDS);
    }

    startPreGameCountdown(duration: number) {
        this.countDownActive = true;
        this.countDownTimerStart = -1;
        this.countDownDuration = duration;
    }

    getCountDownSeconds(time: number) {
        return this.countDownDuration - Math.floor((time - this.countDownTimerStart) / 1000);
    }

    setSettings(roomSettings: RoomSettings) {
        this.roomSettings = roomSettings;
    }

    onUpdate(time: number): void {
        this.time = time;
        if (this.countDownActive && this.countDownTimerStart < 0) {
            this.countDownTimerStart = time;
        } else if (this.countDownActive && time > this.countDownTimerStart + this.countDownDuration * 1000) {
            this.countDownActive = false;
            this.countDownTimerStart = -1;
        } else {
            if (this.isGameOver()) {
                this.onGameOverFunction();
            }
            this.room.mutate(time);
        }

    }

    getPlayerControllerBindings(): { [key: string]: (playerId: string, ...args: any) => void; } {
        return {
            place_bomb: (playerId: string) => {
                if (this.inMatch) {
                    const player = this.room.getPlayer(playerId);
                    if (player.isAlive) {
                        player.placeBomb();
                    }
                }
            },
            set_moving: (playerId: string, direction: Direction) => {
                if (this.inMatch) {
                    const player = this.room.getPlayer(playerId);
                    if (player.isAlive) {
                        player.setMoving(direction);
                    }
                }
            },
            stop_moving: (playerId: string, direction: Direction) => {
                if (this.inMatch) {
                    const player = this.room.getPlayer(playerId);
                    if (player.isAlive) {
                        player.stopMoving(direction);
                    }
                }
            }
        }
    }

    isGameOver(): boolean {
        return this.room.getPlayers().every(p => !p.isAlive);
    }
}