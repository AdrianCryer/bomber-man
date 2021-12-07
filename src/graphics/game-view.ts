import * as PIXI from "pixi.js";
import { SCALE_MODES } from "pixi.js";
import { AbsoluteContainer } from "./absolute-container";
import GameGrid from "./game-grid";
import Modal from "./modal";
import StatusBoard from "./statusboard";

const ASSETS = {    
    "solid": "../assets/solid-sprite.png",
    "open": "../assets/open-sprite.png",
    "brick": "../assets/brick-sprite.png",
    "bomb": "../assets/bomb-spritesheet.json",
    "explosion": "../assets/explosion-spritesheet.json",
    "skull": "../assets/skull.png"
};

export default class GameView extends AbsoluteContainer {

    root: HTMLElement;
    app: PIXI.Application;

    grid: GameGrid;
    statusBoard: StatusBoard;
    gameOverModal: Modal;
    winModal: Modal;
    levelSelector: Modal;
    menu: Modal;

    constructor(root: HTMLElement, defaultWidth?: number, defaultHeight?: number) {
        super();

        this.app = new PIXI.Application({
            width: defaultWidth,
            height: defaultHeight,
            antialias: false,
            resizeTo: window
        });

        this.app.stage.sortableChildren = true;
        root.appendChild(this.app.view);

        // PIXI Global settings
        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;
    }

    resize() {

    }

    async preloadAssets() {
        for (let [name, path] of Object.entries(ASSETS)) {
            this.app.loader.add(name, path);
        }

        const font = new FontFaceObserver("oldschool");
        await font.load();

        // Load maps
    }
}