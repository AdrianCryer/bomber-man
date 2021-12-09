import { Ticker, Loader } from "pixi.js";
import Game from "./model/game";
import GameMap from "./model/game-map";
import GameView from "./graphics/game-view";
import EventEmitter from "events";
import UserController from "./controllers/user-controller";
import MVCBridge from "./bridge";
import { Resources } from "./model/types";

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

const MAPS = {
    'retro': "../maps/retro.txt",
    'basic': "../maps/basic.txt"
};

export default class App {

    root: HTMLElement;
    ticker: Ticker;
    time: number;

    view: GameView;
    model: Game;
    controller: UserController;

    /** Maybe you can see where this is going :)) */
    socket: EventEmitter;

    constructor(root: HTMLElement) {

        this.socket = new EventEmitter();

        this.model = new Game(DEFAULT_GAME_SETTINGS);
        this.view = new GameView(this.socket, root, 1920, 1080);
        this.controller = new UserController(this.socket);

        this.setup();

        // Handle window resizing
        window.addEventListener('resize', () => this.view.resize());
    }

    setup() {
        this.socket.on("play", () => {
            if (!this.model.inMatch) {
                console.log("Starting match");
                // this.model.startMatch('retro', DEFAULT_MATCH_SETTINGS);
            }
        });
    }

    setupMatch() {
        this.ticker = new Ticker();
        this.ticker.stop();

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

    tick() {
        this.model.mutate();
        this.socket.emit("update", {
            game: this.model
        });
    }

    async loadMaps() {
        const loader = new Loader();
        for (let [name, path] of Object.entries(MAPS)) {
            loader.add(name, path);
        }
        const resources: Resources = await new Promise((resolve, reject) => {
            loader.load((loader, resources) => resolve(resources))
        });
        for (let resourceName of Object.keys(resources)) {
            const mapData = resources[resourceName].data;
            this.model.addMap(resourceName, GameMap.loadFromFile(mapData));
        }
    }

    async run() {

        await this.view.preloadAssets();
        await this.loadMaps();

        // Test loading
        setTimeout(() => {
            this.socket.emit("loaded", this.model);
        }, 2000);
    }
}