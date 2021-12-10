import { Ticker, Loader } from "pixi.js";
import Game from "./model/game";
import GameMap from "./model/game-map";
import GameView from "./graphics/game-view";
import EventEmitter from "events";
import UserController from "./controllers/user-controller";
import MVCBridge from "./bridge";
import { Resources } from "./model/types";
import Match from "./model/match";

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
        this.view = new GameView(root, 1920, 1080);
        this.controller = new UserController(this.socket);

        this.setupServer();
        this.setupClient();

        // Handle window resizing
        window.addEventListener('resize', () => this.view.resize());
    }

    /** This method will not touch the view / controller */
    setupServer() {
        this.socket.on("play", () => {
            if (!this.model.inMatch) {

                console.log("Starting match");
                this.model.startDefaultMatch()
                this.socket.emit("start_match", this.model);
            }
        });
        this.socket.on("place_bomb", () => {
            if (this.model.inMatch) {
                // this.model.
            }
        })
    }

    /** This method will not touch the model. */
    setupClient() {
        this.socket.on("ready", (game: Game) => {
            this.view.setupGame(game);
            this.view.setLoaded();
        });
        this.socket.on("start_match", (match: Match) => {
            this.view.startMatch(match);
        });
        this.socket.on("update_match", (match: Match) => {
            this.view.updateMatch(match);
        });

        this.view.onPlay(() => this.socket.emit("play"));
        this.controller.setup();
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
        // this.model.mutateMatch();
        this.socket.emit("update_match", {
            match: this.model.currentMatch
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
            this.socket.emit("ready", this.model);
        }, 2000);
    }
}