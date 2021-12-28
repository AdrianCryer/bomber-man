import { Ticker, Loader } from "pixi.js";
import Game from "./model/game";
import GameMap from "./model/game-map";
import GameView from "./graphics/game-view";
import EventEmitter from "events";
import UserController from "./controllers/user-controller";
import Match from "./model/match";
import shortUUID from "short-uuid";
import { Resources } from "./graphics/screens/match-screen/match-grid";
import { Direction } from "./util/types";

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
    numberOfPlayers: 1,
    statusBoard: {
        alignment: 'left',
        splitRatio: 0.2
    }
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

        this.socket.on("play", () => {
            if (!this.model.inMatch) {

                this.model.startDefaultMatch();
                this.socket.emit("game_ready", this.model);

                // Setup fixed update ticker
                this.ticker.add(() => {
                    let timeNow = (new Date()).getTime();
                    let timeDiff = timeNow - this.time

                    if (timeDiff < Math.round(1000 / TICK_RATE)) {
                        return;
                    }
                    this.time = timeNow;
                    this.model.mutate(timeNow);
                    this.socket.emit("update_match", this.model.currentMatch);

                    const player = this.model.currentMatch.getPlayer(THIS_PLAYER_ID);
                    if (!player.isAlive()) {
                        this.model.endCurrentMatch();
                        this.socket.emit("match_over");
                        this.ticker.stop();
                    }
                });
                this.ticker.start();
            }
        });
        this.socket.on("place_bomb", () => {
            if (this.model.inMatch) {
                const player = this.model.currentMatch.getPlayer(THIS_PLAYER_ID);
                player.placeBomb();
            }
        });
        this.socket.on("set_moving", (direction: Direction) => {
            const player = this.model.currentMatch.getPlayer(THIS_PLAYER_ID);
            player.setMoving(direction);
        });
        this.socket.on("stop_moving", (direction: Direction) => {
            const player = this.model.currentMatch.getPlayer(THIS_PLAYER_ID);
            player.stopMoving(direction);
        });
    }

    /** This method will not touch the model. */
    setupClient() {
        this.socket.on("ready", () => {
            this.view.initialise();
        });
        this.socket.on("game_ready", (game: Game) => {
            this.view.onGameReady(game);
        });

        this.socket.on("update_match", (match: Match) => {
            this.view.onMatchUpdate(match);
        });
        this.socket.on("match_over", () => {
            // this.view.showGameOverScreen();
        });
        this.view.onPlay(() => this.socket.emit("play"));
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
            this.socket.emit("ready", this.model);
        }, 250);
    }
}