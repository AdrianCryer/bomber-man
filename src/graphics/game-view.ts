import * as PIXI from "pixi.js";
import { SCALE_MODES } from "pixi.js";
import FontFaceObserver from "fontfaceobserver";
import Game from "../model/game";
import MatchGrid from "./match-grid";
import Modal from "./modal";
import StatsBoard from "./statsboard";
import Match from "../model/match";
import { AbsoluteContainer } from "./absolute-container";
import Animation from "./animation";
import MenuScreen from "./screens/menu-screen";

const ASSETS = {    
    "solid": "../assets/solid-sprite.png",
    "open": "../assets/open-sprite.png",
    "brick": "../assets/brick-sprite.png",
    "bomb": "../assets/bomb-spritesheet.json",
    "explosion": "../assets/explosion-spritesheet.json",
    "skull": "../assets/skull.png"
};

const STATSBOARD_SPLIT = 0.2;

export default class GameView {

    root: HTMLElement;
    app: PIXI.Application;
    viewBounds: PIXI.Rectangle;

    game: Game;

    grid: MatchGrid;
    statusBoard: StatsBoard;
    gameOverModal: Modal;
    winModal: Modal;
    levelSelector: Modal;
    menuModal: Modal;
    menuScreen: MenuScreen;

    animations: Animation[];

    onPlayFunction: () => void;

    constructor(root: HTMLElement, defaultWidth?: number, defaultHeight?: number) {

        this.root = root;

        this.app = new PIXI.Application({
            // width: defaultWidth,
            // height: defaultHeight,
            antialias: false,
            resizeTo: window
        });

        // this.app.renderer.backgroundColor = 0x564dff;

        this.app.stage.sortableChildren = true;
        root.appendChild(this.app.view);

        // PIXI Global settings
        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;

        this.viewBounds = new PIXI.Rectangle(0, 0, this.app.view.width, this.app.view.height);
        this.animations = [];
        this.app.stage.width = this.app.view.width;
        this.app.stage.height = this.app.view.height;

        this.app.ticker.add(() => {
            for (let animation of this.animations) {
                const elapsedMs = this.app.ticker.elapsedMS;
                animation.tick(elapsedMs);
            }
        })
    }


    onPlay(fn: () => void) {
        this.onPlayFunction = fn
    }

    initialise() {

        this.menuScreen = new MenuScreen(this.app, {
            title: "BOMBERMAN",
            menu: [
                {
                    text: "PLAY",
                    onSelect: this.onPlayFunction
                },
                {
                    text: "VERSUS",
                    onSelect: () => { console.log("Clicked versus" )}
                },
                {
                    text: "SETTINGS",
                    onSelect: () => { console.log("Clicked settings" )}
                }
            ]
        });
        this.menuScreen.show();
        this.app.stage.addChild(this.menuScreen);

        // this.setupMenuModal();
        this.setupGameOverModal();
        // this.menuModal.draw();
        this.gameOverModal.draw();

        // this.app.stage.pivot.set(-this.viewBounds.width / 2, -this.viewBounds.height / 2)
        // const animation = new Animation(this.menuModal, {
        //     duration: 2,
        //     repeat: true
        // });
        // animation.start();
        // this.animations.push(animation);
    }

    updateMatch(match: Match) {
        if (!this.grid) {

            this.menuScreen.hide();
            const [boundsLeft, boundsRight] = 
                AbsoluteContainer.horizontalSplit(this.viewBounds, STATSBOARD_SPLIT);

            this.grid = new MatchGrid(this.app.loader.resources);
            this.grid.setBounds(boundsRight);
            this.app.stage.addChild(this.grid);

            this.statusBoard = new StatsBoard(this.app.loader.resources);
            this.app.stage.addChild(this.statusBoard);

            const gridBounds = this.grid.getRenderableGridBounds(match)
            this.statusBoard.setBounds(new PIXI.Rectangle(
                boundsLeft.x,
                gridBounds.y,
                boundsLeft.width,
                gridBounds.height
            ));
        }
        this.grid.mutate(match);
        this.statusBoard.mutate(match.getPlayers());
    }

    setupGameOverModal() {
        const skullTexture = this.app.loader.resources['skull'].texture;
        const skull = new PIXI.Sprite(skullTexture);

        skull.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        skull.width = 120;
        skull.height = 120;
        skull.anchor.set(0.5, 0.5);
        skull.tint = 0x262626;

        this.gameOverModal = new Modal(this.viewBounds, {
            padding: 40,
            title: "Game Over",
            showCancelButton: true,
            cancelButtonText: "Retry",
            confirmButtonText: "Menu",
            darkenBackground: true,
            modalSizeRatio: { width: 0.6, height: 0.5 },
            buttonSizeRatio: { width: 0.2, height: 0.1 },
            icon: skull,
            onConfirm: () => {
                this.app.stage.removeChild(this.grid);
                this.app.stage.removeChild(this.statusBoard);
                this.grid = null;
                this.showMenuScreen();
            },
            onCancel: () => {
                this.app.stage.removeChild(this.grid);
                this.app.stage.removeChild(this.statusBoard);
                this.grid = null;
                this.gameOverModal.visible = false;
                this.onPlayFunction()
            }
        });
        // this.gameOverModal.position.set(this.gameOverModal.modalBounds.x, this.gameOverModal.modalBounds.y);
        this.gameOverModal.zIndex = 10;
        this.app.stage.addChild(this.gameOverModal);
        this.gameOverModal.visible = false;
    }

    showMenuScreen() {
        console.log("Showing menu screen");
        this.menuScreen.show();
        this.gameOverModal.visible = false;
        if (this.grid) {
            this.grid.visible = false;
            this.statusBoard.visible = false;
        }
    }

    showGameOverScreen() {
        this.gameOverModal.visible = true;
    }

    showWinScreen() {

    }

    setupMenuModal() {
        this.menuModal = new Modal(this.viewBounds, {
            padding: 40,
            title: "Bomberman",
            showCancelButton: false,
            confirmButtonText: "Play",
            darkenBackground: true,
            modalSizeRatio: { width: 0.6, height: 0.25 },
            buttonSizeRatio: { width: 0.2, height: 0.2 },
            onConfirm: () => this.onPlayFunction(),
        });
        const width = this.menuModal.getBounds().width * this.menuModal.options.modalSizeRatio.width;
        const height = this.menuModal.getBounds().height * this.menuModal.options.modalSizeRatio.height;

        const container = new PIXI.Container();
        container.addChild(this.menuModal);
        this.app.stage.addChild(container);

        container.position.set(this.viewBounds.width / 2, this.viewBounds.height / 2);
        this.menuModal.pivot.set(width / 2, height / 2)
        this.menuModal.visible = false;
    }

    resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.viewBounds = new PIXI.Rectangle(0, 0, this.app.screen.width, this.app.screen.height);

        if (this.grid) {
            this.app.stage.removeChild(this.grid);
            this.app.stage.removeChild(this.statusBoard);
            this.grid = null;
            this.updateMatch(this.game.currentMatch);
        }
    }

    async preloadAssets() {
        for (let [name, path] of Object.entries(ASSETS)) {
            this.app.loader.add(name, path);
        }
        await new Promise(resolve => {
            this.app.loader.load((_, resources) => resolve(resources))
        });

        const font = new FontFaceObserver("oldschool");
        await font.load();
    }
}