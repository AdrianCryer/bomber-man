import { Ticker } from "pixi.js";
import { PlayerController } from "./controllers/player-controller";
import Game from "./game";
import GameMap from "./game-map";
import GameView from "./graphics/game-view";

/**
 * APP: Combines the Model, View and Controllers (MVC).
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

export default class App {

    root: HTMLElement;
    ticker: Ticker;
    time: number;

    view: GameView;
    model: Game;
    controller: PlayerController;

    constructor(root: HTMLElement) {

        // this.model = new Game()
        this.view = new GameView(root, 1920, 1080);
        this.ticker = new Ticker();

        // Handle window resizing
        window.addEventListener('resize', () => this.view.resize());
    }

    async load() {

        await this.view.preloadAssets();

        // this.model = new Game()
        // this.controller = new UserInputController(this.model)

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

    tick() {
        // this.model.update();
    }

    run() {
        
    }
}