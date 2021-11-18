import * as PIXI from "pixi.js";
import { Graphics, settings } from "pixi.js";
import GameMap, { CellType } from "./game-map";
import Player from "./player";
import { UserInputController } from "./player-controller";

export type GameSettings = {

    // The map to play
    map: GameMap;

    // Number of bots in the game
    bots: number;

    // Bot difficulty
    difficulty: 'easy' | 'medium' | 'hard';

    // Starting speed of all players
    initialSpeed: number;

    // Blocks per second
    speedCap: number;

    // Tickrate to preform fixed updates (i.e., movement)
    tickrate: number;
};

type GameCell = {
    players: any[];
    powerups: any[];
    hasBomb: boolean;
    hasBlock: boolean;
}

export default class Game {

    settings: GameSettings;
    app: PIXI.Application;
    gameState: GameCell[][];
    players: Player[];
    time: number;

    constructor(app: PIXI.Application, settings: GameSettings) {
        this.settings = settings;
        this.app = app;

        // Setup players
        this.players = [];

        // Add human player
        this.players.push(new Player(
            0, 
            new Graphics(),
            new UserInputController()
        ));

        // Add bots
        // for (let i = 0; i < settings.bots; i++) {
        //     this.players.push(

        //     )
        // } 
        
        for (let player of this.players) {
            player.controller.setup(this, player);
        }

        // Set initial positions
        const startingPositions = settings.map.startingPositions;
        this.players[0].position = startingPositions[0];
        this.players[0].speed = settings.initialSpeed;

    }

    private renderCell(x: number, y: number, width: number, type: CellType) {
        const cell = new PIXI.Graphics();
        const colour = (type === CellType.OPEN || type == CellType.SPAWN) ? 0x7bad56 : 0x999999;
        cell.beginFill(colour)
            .lineStyle(1, 0xFFFFFF, 1)
            .drawRect(x, y, width, width)
            .endFill();
        this.app.stage.addChild(cell);
    }

    private renderGrid() {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        const cellWidth = Math.min(
            this.app.screen.width / mapWidth,
            this.app.screen.height / mapHeight,
        );

        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                this.renderCell(
                    j * cellWidth, 
                    i * cellWidth, 
                    cellWidth, 
                    this.settings.map.getCell(i, j)
                );
            }
        }
    }

    renderPlayers(initialPass: boolean = false) {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        const cellWidth = Math.min(
            this.app.screen.width / mapWidth,
            this.app.screen.height / mapHeight,
        );
        
        
        for (let player of this.players) {
            if (initialPass || player.moving.x !== 0 || player.moving.y !== 0) {
                player.graphic.clear();
                player.graphic
                    .beginFill(0xEA4C46)
                    .drawRect(
                        (0.25 + player.position.x) * cellWidth, 
                        (0.25 + player.position.y) * cellWidth, 
                        cellWidth / 2,
                        cellWidth / 2
                    )
                    .endFill();
                if (initialPass) {
                    this.app.stage.addChild(player.graphic);
                }
            }
        }
    }

    start() {
        // Render grid,
        this.renderGrid();
        this.app.ticker.add(() => {
            let timeNow = (new Date()).getTime();
            let timeDiff = timeNow - this.time;

            if (timeDiff < Math.round(1000 / this.settings.tickrate)) {
                return;
            }
            this.time = timeNow;
            this.fixedUpdate();
        });
        this.renderPlayers(true);
        this.app.ticker.add(() => this.renderPlayers(true));
    }

    canMoveX(player: Player): boolean {
        let { x, y } = player.position;
        x = Math.ceil(x);
        y = Math.ceil(y);
        return this.settings.map.getCell(y, x + player.moving.x) !== CellType.BRICK;
    }

    canMoveY(player: Player): boolean {
        let { x, y } = player.position;
        x = Math.ceil(x);
        y = Math.ceil(y);
        return this.settings.map.getCell(y + player.moving.y, x) !== CellType.BRICK;
    }

    fixedUpdate() {

        // Apply movement
        for (let player of this.players) {
            console.log(player.position)
            if (player.moving.x !== 0 && this.canMoveX(player)) {
                player.position.x += player.moving.x * player.speed  / this.settings.tickrate;
            }
            if (player.moving.y !== 0  && this.canMoveY(player)) {
                player.position.y += player.moving.y * player.speed / this.settings.tickrate;
            }
        }
    }

    loop() {
        this.renderPlayers();
    }
}