import * as PIXI from "pixi.js";
import { SCALE_MODES } from "pixi.js";
import Game from "../model/_game";
import { Resources } from "../types";
import { AbsoluteContainer } from "./absolute-container";
import MatchGrid from "./match-grid";
import Modal from "./modal";
import StatusBoard from "./statusboard";
import { EventEmitter } from "stream";
import Match from "../model/match";

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
    viewBounds: PIXI.Rectangle;

    game: Game;

    grid: MatchGrid;
    statusBoard: StatusBoard;
    gameOverModal: Modal;
    winModal: Modal;
    levelSelector: Modal;
    menu: Modal;

    private _isLoading: boolean;

    constructor(root: HTMLElement, defaultWidth?: number, defaultHeight?: number) {
        super();

        this.root = root;
        this.isLoading = true;

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


        // this.app.ticker.add(() => this.draw());
    }

    setup(bridge: EventEmitter) {
        bridge.on("start_match", (match: Match) => {
            this.grid = new MatchGrid(match);
        });
        bridge.on("update_match", (match: Match) => {
            this.grid.mutate(match);
        });
        bridge.on("start_game", () => {
            
        });
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public set isLoading(value: boolean) {
        this._isLoading = value;
    }

    renderLoading() {
        // Make some loading text.s
    }

    resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.viewBounds = new PIXI.Rectangle(0, 0, this.app.screen.width, this.app.screen.height);


        if (this.game.inMatch) {
            this.grid.setBounds(this.viewBounds);
            this.grid.resize();
        }
    }

    async preloadAssets() {
        for (let [name, path] of Object.entries(ASSETS)) {
            this.app.loader.add(name, path);
        }

        const font = new FontFaceObserver("oldschool");
        await font.load();

        // Load maps
    }

    draw() {
        if (this.isLoading) {
            this.renderLoading();
        }

        this.grid.draw();
    }
}