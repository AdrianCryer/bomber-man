import { Ticker } from "pixi.js";
import Game from "./model/_game";
import GameMap from "./model/game-map";
import GameView from "./graphics/game-view";
import EventEmitter from "events";
import UserController from "./controllers/user-controller";
import MVCBridge from "./bridge";

/**
 * APP: Combines the Model, View and Controllers (MVC). 
 * With an event emitter being used as a middle man
 * 
 * 
 * MODEL:
 *      GAME
 *          MATCH
 * VIEW
 *      GAMEVIEW
 *          STATSBOARD
 *          GAMEGRID
 *          GAMEOVERMODAL
 *          WIN MODAL
 *          MENU
 * 
 * CONTROLLER
 *      PLAYER CONTROLLER
 */

const TICK_RATE = 64;
const DEFAULT_GAME_SETTINGS = {
    statusBoard: {
        alignment: 'left',
        splitRatio: 0.2
    }
};

const DEFAULT_MATCH_SETTINGS = {
    map: 'retro',
    bots: 1,
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
        explosionRadius: 5,
        bombCount: 1,
        bombTimer: 3
    },
    powerups:  [
        { name: 'Speed Up', stat: 'speed', delta: 1, rarity: 1 },
        { name: 'Bomb range up', stat: 'explosionRadius', delta: 1, rarity: 1 },
        { name: 'Big bombs', stat: 'explosionRadius', delta: 3, rarity: 2 }
    ],
    powerupRarityStepFunction: (maxRarity: number, val: number) => {
        return Math.floor(maxRarity * val**2) + 1;
    }
};


export default class App {

    root: HTMLElement;
    ticker: Ticker;
    time: number;

    view: GameView;
    model: Game;
    controller: UserController;
    bridge: EventEmitter;

    constructor(root: HTMLElement) {

        
        this.model = new Game(DEFAULT_GAME_SETTINGS);
        this.view = new GameView(root, 1920, 1080);
        this.controller = new UserController();

        this.bridge = new MVCBridge(this.model, this.view, this.controller);

        this.ticker = new Ticker();
        this.ticker.stop();

        // Handle window resizing
        window.addEventListener('resize', () => this.view.resize());
    }

    async load() {

        await this.view.preloadAssets();
        await this.loadMaps();

        // Setup fixed update ticker
        this.ticker.add(() => {
            let timeNow = (new Date()).getTime();
            let timeDiff = timeNow - this.time

            if (timeDiff < Math.round(1000 / TICK_RATE)) {
                return;
            }
            this.time = timeNow;
            this.tick();
        });
        
    }

    async loadMaps(): Promise<GameMap[]> {
        return;
    }

    // setup() {
    //     this.bridge.on("start", () => {
    //         this.model.start(DEFAULT_MATCH_SETTINGS);
    //         this.ticker.start();
    //     })
    //     // this.bridge.on("")
    // }

    tick() {
        this.model.mutate();
        this.bridge.emit("update", {
            game: this.model
        });
    }

    async run() {
        this.view.isLoading = true;
        await this.load();
        this.view.isLoading = false;
        // this.ticker.start();
    }
}