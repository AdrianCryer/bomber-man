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
    socket: EventEmitter;

    constructor(socket: EventEmitter, root: HTMLElement, defaultWidth?: number, defaultHeight?: number) {

        this.socket = socket;
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
        this.setup();
        this.setupMenuModal();

        this.app.ticker.add(() => this.draw());
    }

    setup() {
        this.socket.on("loaded", (game: Game) => {
            this.isLoading = false;
            this.game = game;
            this.menuModal.draw();
        });
        this.socket.on("start_match", (match: Match) => {
            this.grid = new MatchGrid(match);
        });
        this.socket.on("update_match", (match: Match) => {
            this.grid.mutate(match);
        });
        this.socket.on("start_game", () => {

        });
    }

    renderLoading() {
        // Make some loading text.s
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
            onConfirm: () => this.socket.emit("play"),
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

    async preloadMaps(paths: Record<string, string>): Promise<Record<string, GameMap>> {
        // Load maps
        for (let [name, path] of Object.entries(paths)) {
            this.app.loader.add(name, path);
        }
        
        let maps: Record<string, GameMap> = {};
        // this.app.loader.onComplete.add(() => {
        //     for (let name of Object.keys(paths)) {
        //         const map = GameMap.loadFromFile(this.app.loader.resources["MAP_" + name].data);
        //         maps[name] = map;
        //     }
        // });
        const resources = await new Promise((resolve, reject)=> this.app.loader.load((loader, resources) => resolve(resources)));
        console.log(resources)
        // return resources;

        return null;
        // await new Promise(function(resolve, reject) {
        //     this.app.loader.load(function() {
        //       resolve();
        //     });
        // });
        // return maps;
    }

    draw() {
        if (this.isLoading) {
            this.app.renderer.backgroundColor = 0x564dff;
        } else if (this.game.inMatch) {
            this.menuModal.hidden = true;
        }

        // this.grid.draw();
    }
}