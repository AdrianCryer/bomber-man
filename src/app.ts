import * as PIXI from "pixi.js"
import { SCALE_MODES } from "pixi.js";
import Game from "./game";
import GameMap from "./game-map";
import StatusBoard from "./statusboard";
import { GameSettings } from "./types";

import basicMap from "../maps/basic.txt";
import retroMap from "../maps/retro.txt";


const assets = {    
    "solid": "../assets/solid-sprite.png",
    "open": "../assets/open-sprite.png",
    "brick": "../assets/brick-sprite.png",
    "bomb": "../assets/bomb-spritesheet.json",
    "explosion": "../assets/explosion-spritesheet.json",
    '04B_30__': '../assets/fonts/04B_30__.TTF'
};

export default class App {

    root: HTMLElement;
    app: PIXI.Application;
    
    game: Game;
    gameContainer: PIXI.Container;
    gameRoot: PIXI.Graphics;
    
    StatusBoard: StatusBoard;

    private StatusBoardRatio: number = 0.3;

    constructor(window: any, root: HTMLElement) {
        this.app = new PIXI.Application({
            width: 1920,
            height: 1080,
            antialias: false,
            resizeTo: window
        });
        this.app.stage.sortableChildren = true;

        root.appendChild(this.app.view);

        // Handle window resizing
        window.addEventListener('resize', () => this.resize());

        // PIXI Global settings
        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;

        // Load assets
        for (let [name, path] of Object.entries(assets)) {
            this.app.loader.add(name, path);
        }

        this.gameContainer = new PIXI.Container();
        this.gameContainer.scale.set(this.app.screen.width, this.app.screen.height);
        this.app.renderer.backgroundColor = 0x564dff;
        this.app.stage.addChild(this.gameContainer);
    }

    resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.gameContainer.scale.set(this.app.screen.width, this.app.screen.height);

        if (this.game) {
            this.game.resize();
        }
    }

    async setup() {
        const mapString = await GameMap.loadMapFile(retroMap);
        const settings: GameSettings = {
            map: GameMap.loadFromFile(mapString),
            bots: 1,
            difficulty: 'easy',
            initialSpeed: 3,
            speedCap: 10,
            tickrate: 64,
            brickSpawnPercentage: 0.3,
            statusBoard: {
                alignment: 'left',
                splitRatio: 0.2
            }
        };

        const resources = this.app.loader.resources;
        const ticker = this.app.ticker;

        this.game = new Game(this.gameContainer, ticker, resources, settings);
        this.game.start()
    }

    async run() {
        this.app.loader.load(() => this.setup());
    }
}