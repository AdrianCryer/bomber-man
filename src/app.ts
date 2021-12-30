import { Ticker, Loader } from "pixi.js";
import Game, { GameMode } from "./model/game";
import GameMap from "./model/game-map";
import GameView from "./graphics/game-view";
import EventEmitter from "events";
import UserController from "./controllers/user-controller";
import shortUUID from "short-uuid";
import { Resources } from "./util/types";
import { throws } from "assert";

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

// const TICK_RATE = 64;
const DEFAULT_GAME_SETTINGS = {
    tickrate: 64
};

const MAPS = {
    'retro': "../maps/retro.txt",
    'basic': "../maps/basic.txt"
};

/** If this was the server, we can simply use the socket id. */
const THIS_PLAYER_ID = shortUUID.generate();

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

        this.model = new Game(DEFAULT_GAME_SETTINGS, [THIS_PLAYER_ID]);
        this.view = new GameView(root, THIS_PLAYER_ID, 1920, 1080);
        this.controller = new UserController(this.socket);

        this.setupServer();
        this.setupClient();

        // Handle window resizing
        window.addEventListener('resize', () => this.view.resize());
    }

    /** This method will not touch the view / controller */
    setupServer() {
        this.ticker = new Ticker();
        this.ticker.stop();

        this.socket.on("play", (mode: GameMode) => {
            if (!this.model.isInMatch()) {

                if (mode === 'versus') {
                    this.model.initialiseVersusMatch();
                } else if (mode === 'rogue') {
                    this.model.initialiseRogueMatch();
                }

                this.socket.emit("match_ready", {
                    match: this.model.currentMatch, 
                    mode
                });
            }
        });

        this.socket.on("client_match_loaded", () => {
            
            console.log("CLIENT LOADED")
            // Handle Game Over
            this.model.currentMatch.onGameOver(() => {
                this.socket.emit("match_over");
                this.ticker.stop();
            });

            // Setip player controller specific to the current match.
            const bindings = this.model.currentMatch.getPlayerControllerBindings();
            for (let [key, fn] of Object.entries(bindings)) {
                this.socket.on(key, (...args: any) => fn(THIS_PLAYER_ID, ...args));
            }

            this.model.currentMatch.start();
            
            // Setup fixed update ticker
            this.ticker.add(() => {
                let timeNow = (new Date()).getTime();
                let timeDiff = timeNow - this.time

                if (timeDiff < Math.round(1000 / this.model.settings.tickrate)) {
                    return;
                }
                this.time = timeNow;
                this.model.onUpdate(timeNow);
                this.socket.emit("match_update", this.model.currentMatch);
            });
            this.ticker.start();
        });
    }

    /** This method will not touch the model. */
    setupClient() {
        this.socket.on("client_game_loaded", () => this.view.initialise());
        this.socket.on("match_ready", (args) => this.view.onMatchReady(args));
        this.socket.on("match_update", (match) => this.view.onMatchUpdate(match));
        this.socket.on("match_over", () => {
            console.log("Game over")
        });
        this.view.onPlay((mode) => this.socket.emit("play", mode));
        this.view.onMatchLoaded(() => this.socket.emit("client_match_loaded"))
        this.controller.setup();
    }

    async loadMaps() {
        const loader = new Loader();
        for (let [name, path] of Object.entries(MAPS)) {
            loader.add(name, path);
        }
        const resources: Resources = await new Promise(resolve => {
            loader.load((_, resources) => resolve(resources))
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
            this.socket.emit("client_game_loaded", this.model);
        }, 250);
    }
}