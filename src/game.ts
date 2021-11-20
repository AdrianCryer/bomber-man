import * as PIXI from "pixi.js";
import { Graphics, settings } from "pixi.js";
import GameMap, { CellType } from "./game-map";
import Player, { Bomb, Direction } from "./player";
import { UserInputController } from "./player-controller";
import { Position } from "./types";

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
    powerups: any[];
    bombs: Bomb[];
    explosions: Explosion[];
    hasBlock: boolean;
};

type Explosion = {
    graphic: Graphics;
    addedToCanvas: boolean;
    center: Position;
    radius: number;
    duration: number;
    timeCreated: number;
};

export default class Game {

    settings: GameSettings;
    app: PIXI.Application;
    // gridState: GameCell[][];
    explosions: Explosion[];
    players: Player[];
    time: number;

    constructor(app: PIXI.Application, settings: GameSettings) {
        this.settings = settings;
        this.app = app;

        // Set initial positions
        const startingPositions = settings.map.startingPositions;

        // Setup players
        this.players = [];
        this.explosions = [];

        // Add human player
        this.players.push(new Player(
            0, 
            new Graphics(),
            new UserInputController(),
            {
                position: settings.map.startingPositions[0],
                speed: settings.initialSpeed,
                bombCount: 1,
                bombExplosionRadius: 5,
                bombExplosionDuration: 1,
                bombTimer: 1
            }
        ));

        // Add bots
        // for (let i = 0; i < settings.bots; i++) {
        //     this.players.push(

        //     )
        // } 
        
        for (let player of this.players) {
            player.controller.setup(this, player);
        }
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
            // if (player.wantsToMove) {
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
            // }
            if (initialPass) {
                this.app.stage.addChild(player.graphic);
            }
        }
    }

    renderBomb(bomb: Bomb) {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        const cellWidth = Math.min(
            this.app.screen.width / mapWidth,
            this.app.screen.height / mapHeight,
        );

        bomb.graphic.clear();
        bomb.graphic
            .beginFill(0x3A3B3C)
            .drawCircle(
                (0.5 + bomb.position.x) * cellWidth,
                (0.5 + bomb.position.y) * cellWidth,
                cellWidth / 3
            )
            .endFill();
        if (!bomb.addedToCanvas) {
            this.app.stage.addChild(bomb.graphic);
            bomb.addedToCanvas = true;
        }
    }

    private renderExplosionAtCell(explosion: Explosion, x: number, y: number) {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        const cellWidth = Math.min(
            this.app.screen.width / mapWidth,
            this.app.screen.height / mapHeight,
        );
        
        explosion.graphic
            .beginFill(0xB53737)
            .drawRect(
                x * cellWidth, 
                y * cellWidth, 
                cellWidth, 
                cellWidth
            );
        if (!explosion.addedToCanvas) {
            explosion.addedToCanvas = true;
            this.app.stage.addChild(explosion.graphic);
        }
    }

    renderExplosion(explosion: Explosion) {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        let { x, y } = explosion.center;
        let i = 0;
        let stopped = Array(4).fill(false).slice();
        
        explosion.graphic.clear();
        this.renderExplosionAtCell(explosion, x, y);


        while (i <= explosion.radius - 1) {
            stopped = [
                stopped[0] || x + i >= mapWidth || this.isBlocked(x + i , y),
                stopped[1] || x - i < 0 || this.isBlocked(x - i , y),
                stopped[2] || y + i >= mapHeight || this.isBlocked(x , y + i),
                stopped[3] || y - i < 0 || this.isBlocked(x , y - i)
            ];
            if (!stopped[0]) {
                this.renderExplosionAtCell(explosion, x + i, y);
            }
            if (!stopped[1]) {
                this.renderExplosionAtCell(explosion, x - i, y);
            }
            if (!stopped[2]) {
                this.renderExplosionAtCell(explosion, x, y + i);
            }
            if (!stopped[3]) {
                this.renderExplosionAtCell(explosion, x, y - i);
            }
            i++;
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
            this.fixedUpdate(timeNow);
        });
        this.renderPlayers(true);
        this.app.ticker.add(() => this.loop())
    }

    isBlocked(x: number, y: number): boolean {
        return this.settings.map.getCell(y, x) === CellType.BRICK;
    }

    canMove(player: Player): boolean {

        if (player.inTransition) {
            return false;
        }

        let { x, y } = player.cellPosition;
        if (player.movingDirection === Direction.UP) {
            y -= 1;
        } else if (player.movingDirection === Direction.DOWN) {
            y += 1;
        } else if (player.movingDirection === Direction.LEFT) {
            x -= 1;
        } else if (player.movingDirection === Direction.RIGHT) {
            x += 1;
        }
        return this.settings.map.getCell(y, x) !== CellType.BRICK;
    }

    fixedUpdate(time: number) {

        for (let player of this.players) {
            
            // Apply bombs
            for (let [i, bomb] of player.bombs.entries()) {

                // Explode
                if (time >= bomb.timePlaced + bomb.timer * 1000) {
                    this.explosions.push({
                        graphic: new Graphics(),
                        addedToCanvas: false,
                        center: bomb.position,
                        radius: bomb.explosionRadius,
                        duration: bomb.explosionDuration,
                        timeCreated: time,
                    });

                    // Remove bomb
                    player.bombs.splice(i, 1);
                    this.app.stage.removeChild(bomb.graphic);
                }
            }

            for (let [i, explosion] of this.explosions.entries()) {
                // Remove Explosion
                if (time >= explosion.timeCreated + explosion.duration * 1000) {
                    this.explosions.splice(i, 1);
                    this.app.stage.removeChild(explosion.graphic);
                }
            }

            // Apply movement
            if (!player.inTransition && player.wantsToMove && this.canMove(player)) {
                player.moveTransitionPercent = 0;
                player.moveTransitionDirection = player.movingDirection;
                player.inTransition = true;
            }

            if (player.inTransition) {  
                player.moveTransitionPercent += player.speed  / this.settings.tickrate;
                player.moveTransitionPercent = Math.min(player.moveTransitionPercent, 1);

                if (player.moveTransitionDirection === Direction.UP) {
                    player.position.y = player.cellPosition.y - player.moveTransitionPercent;
                } else if (player.moveTransitionDirection === Direction.DOWN) {
                    player.position.y = player.cellPosition.y + player.moveTransitionPercent;
                } else if (player.moveTransitionDirection === Direction.LEFT) {
                    player.position.x = player.cellPosition.x - player.moveTransitionPercent;
                } else if (player.moveTransitionDirection === Direction.RIGHT) {
                    player.position.x = player.cellPosition.x + player.moveTransitionPercent;
                }

                if (player.moveTransitionPercent === 1) {
                    player.inTransition = false;
                    player.cellPosition = {
                        x: Math.round(player.position.x),
                        y: Math.round(player.position.y),
                    };
                }
            }
        }
    }

    loop() {
        this.renderPlayers(false);
        for (let player of this.players) {
            for (let bomb of player.bombs) {
                this.renderBomb(bomb);
            }
        }
        for (let explosion of this.explosions) {
            this.renderExplosion(explosion)
        }
    }
}