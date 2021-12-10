import * as PIXI from "pixi.js";
import { SCALE_MODES } from "pixi.js";
import FontFaceObserver from "fontfaceobserver";
import Game from "../model/game";
import { AbsoluteContainer } from "./absolute-container";
import MatchGrid from "./match-grid";
import Modal from "./modal";
import StatusBoard from "./statusboard";
import { EventEmitter } from "stream";
import Match from "../model/match";
import GameMap from "../model/game-map";

const ASSETS = {    
    "solid": "../assets/solid-sprite.png",
    "open": "../assets/open-sprite.png",
    "brick": "../assets/brick-sprite.png",
    "bomb": "../assets/bomb-spritesheet.json",
    "explosion": "../assets/explosion-spritesheet.json",
    "skull": "../assets/skull.png"
};

export default class GameView {

    root: HTMLElement;
    app: PIXI.Application;
    viewBounds: PIXI.Rectangle;

    game: Game;

    grid: MatchGrid;
    statusBoard: StatusBoard;
    gameOverModal: Modal;
    winModal: Modal;
    levelSelector: Modal;
    menuModal: Modal;
    
    isLoading: boolean;

    onPlayFunction: () => void;

    constructor(root: HTMLElement, defaultWidth?: number, defaultHeight?: number) {

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

        this.viewBounds = new PIXI.Rectangle(0, 0, this.app.view.width, this.app.view.height);
        this.setupMenuModal();

        this.app.ticker.add(() => this.draw());
    }

    setLoaded() {
        this.isLoading = false;
        this.menuModal.draw();
    }

    onPlay(fn: () => void) {
        this.onPlayFunction = fn
    }

    setupGame(game: Game) {
        this.game = game;
    }

    startMatch(match: Match) {
        this.app.stage.removeChild(this.menuModal);
        this.grid = new MatchGrid(match, this.app.loader.resources);
    }

    updateMatch(match: Match) {
        this.game.currentMatch = match;
        this.grid.mutate(match);
    }

    showGameOverScreen() {

    }

    showWinScreen() {

    }

    setLoading(loading: boolean) {
        this.isLoading = loading;
    }

    setupMenuModal() {
        console.log(this.viewBounds);
        this.menuModal = new Modal(this.viewBounds, {
            padding: 40,
            title: "Bomberman",
            showCancelButton: false,
            confirmButtonText: "Play",
            darkenBackground: true,
            modalWidthRatio: 0.5,
            modalHeightRatio: 0.25,
            onConfirm: () => this.onPlayFunction(),
        });
        this.app.stage.addChild(this.menuModal);
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
    }

    draw() {
        if (this.isLoading) {
            this.app.renderer.backgroundColor = 0x564dff;
        } else if (this.game.inMatch) {
            this.menuModal.hidden = true;
            this.grid.draw();
        }
    }
}