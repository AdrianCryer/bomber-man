import * as PIXI from "pixi.js";
import { SCALE_MODES } from "pixi.js";
import FontFaceObserver from "fontfaceobserver";
import Game, { GameMode } from "../model/game";
import { AbsoluteContainer } from "./absolute-container";
import MenuScreen from "./screens/menu-screen";
import ScreenManager from "./screens/screen-manager";
import Match from "../model/gamemodes/match";
import RoomScreen from "./screens/room-screen";
import VersusMatch from "../model/gamemodes/versus-match";

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
    playerId: string;
    screenManager: ScreenManager;

    onPlayFunction: (mode: GameMode) => void;

    constructor(root: HTMLElement, playerId: string, defaultWidth?: number, defaultHeight?: number) {

        this.root = root;
        this.app = new PIXI.Application({
            // width: defaultWidth,
            // height: defaultHeight,
            antialias: false,
            resizeTo: window
        });
        this.playerId = playerId;

        this.app.stage.sortableChildren = true;
        root.appendChild(this.app.view);

        // PIXI Global settings
        PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;

        this.viewBounds = new PIXI.Rectangle(0, 0, this.app.view.width, this.app.view.height);
        this.app.stage.width = this.app.view.width;
        this.app.stage.height = this.app.view.height;
    }

    onPlay(fn: (mode: GameMode) => void) {
        this.onPlayFunction = fn
    }

    createIntermediateScreen() {
        const intermediateScreen = new AbsoluteContainer();
        intermediateScreen.setBounds(this.viewBounds);

        const style = new PIXI.TextStyle({
            fontFamily: "8-bit Arcade In",
            fontStyle: "normal",
            fill: '#FFFFFF',
            dropShadow: true,
            dropShadowAngle: 0.57,
            dropShadowDistance: 3,
            fontSize: 80,
            strokeThickness: 3
        });

        const centerText = new PIXI.Text("LOADING", style);
        centerText.position.set(this.viewBounds.width / 2, this.viewBounds.height / 2);
        centerText.anchor.set(0.5);
        intermediateScreen.addChild(centerText);

        return intermediateScreen;
    }

    initialise() {
        this.screenManager = new ScreenManager(this.app);

        const intermediateScreen = this.createIntermediateScreen();
        const onClickPlay = (mode: GameMode) => {
            this.screenManager.navigate(
                "intermediate",
                intermediateScreen,
                { transitionName: 'radial-in' }
            );
            this.onPlayFunction(mode);
        };
        
        this.screenManager.navigate(
            "menu",
            new MenuScreen(this.app, {
                title: "BOMBERMAN",
                menu: [
                    {
                        text: "PLAY",
                        onSelect: () => onClickPlay('rogue')
                    },
                    {
                        text: "VERSUS",
                        onSelect: () => onClickPlay('versus')
                    },
                    {
                        text: "SETTINGS",
                        onSelect: () => { console.log("Clicked settings" )}
                    }
                ]
            })
        );
    }

    onMenuClickPlay(mode: GameMode) {
        if (mode === 'rogue') {
            // Start into game

        } else if (mode === 'versus') {
            /** @todo Show menu */


        } else if (mode === 'levels') {
            // Show level select
        }
    }

    onMatchReady(args: { match: Match, mode: GameMode }) {
        if (args.mode === 'versus') {
            const versusMatch = args.match as VersusMatch;
            setTimeout(() => {
                this.screenManager.navigate(
                    "match", new RoomScreen(this.app, versusMatch.room, this.playerId),
                    { transitionName: 'radial-out' }
                );
            }, 2000);
        }
    }

    onMatchUpdate(match: Match) {
        const matchScreen = this.screenManager.getScreen("match") as RoomScreen;
        if (matchScreen) {
            matchScreen.updateMatch((match as VersusMatch).room);
        }
    }

    resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.viewBounds = new PIXI.Rectangle(0, 0, this.app.screen.width, this.app.screen.height);

        // if (this.matchScreen) {
            // this.app.stage.removeChild(this.matchScreen);
            // this.matchScreen = null;
            // this.updateMatch(this.game.currentMatch);
        // }
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