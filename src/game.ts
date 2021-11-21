import * as PIXI from "pixi.js";
import { Graphics, Sprite } from "pixi.js";
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

    // Percentage of brick spawns
    brickSpawnPercentage: number;
};

type Explosion = {
    graphic: Graphics;
    addedToCanvas: boolean;
    center: Position;
    radius: number;
    duration: number;
    timeCreated: number;
    affectedCells: Position[];
};

type Brick = GameCell & {
    variant: 'soft' | 'hard';
};

type GameCell = {
    graphic: PIXI.Sprite;
    type: CellType;
}

export default class Game {

    settings: GameSettings;
    app: PIXI.Application;
    explosions: Explosion[];
    players: Player[];
    cells: GameCell[][];
    time: number;

    cellsContainer: PIXI.Container;
    itemsContainer: PIXI.Container;

    constructor(app: PIXI.Application, settings: GameSettings) {
        this.settings = settings;
        this.app = app;
        app.stage.sortableChildren = true;

        // Set initial positions
        const startingPositions = settings.map.startingPositions;

        // Setup grid
        const { height, width} = this.settings.map.props;
        this.cells = [];
        for (let i = 0; i < height; i++) {
            this.cells[i] = new Array(width);
        }

        this.loadMap();
        this.spawnBricks();

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
                bombTimer: 5
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

    private loadMap() {
        const { height, width} = this.settings.map.props;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const imageName = this.settings.map.getCell(i, j) === CellType.SOLID ? 'solid' : 'open';
                this.cells[i][j] = this.createCell(this.settings.map.getCell(i, j), imageName);;
            }
        }
    }

    createCell(cellType: CellType, spriteName: string): GameCell {
        const texture = this.app.loader.resources[spriteName].texture;

        let cell = {
            graphic: new Sprite(texture),
            type: cellType,
        } as GameCell;

        if (cellType === CellType.BRICK) {
            cell = {
                ...cell,
                variant: Math.random() < 0.5 ? 'soft' : 'hard'
            } as Brick;
        }

        return cell;
    }

    private spawnBricks() {
        const { height, width } = this.settings.map.props;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {

                if (this.cells[i][j].type === CellType.OPEN && 
                    Math.random() <= this.settings.brickSpawnPercentage) {

                    this.cells[i][j] = this.createCell(CellType.BRICK, 'brick');
                }
            }
        }
    }

    private renderCell(x: number, y: number, cell: GameCell, intialPass=true) {

        const cellWidth = Math.min(
            this.app.screen.width / this.settings.map.props.width,
            this.app.screen.height / this.settings.map.props.height,
        );

        let colour = 0x999999;
        switch (cell.type) {
            case (CellType.OPEN):
            case (CellType.SPAWN):
                colour = 0x7bad56;
                break;
            case (CellType.BRICK):
                colour = 0xBC4A3C;
                break;
        }

        cell.graphic.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        cell.graphic.position.x = x * cellWidth;
        cell.graphic.position.y = y * cellWidth;
        cell.graphic.width = cellWidth;
        cell.graphic.height = cellWidth;

        if (intialPass) {

            cell.graphic.zIndex = 0;
            this.app.stage.addChild(cell.graphic);
        }
    }

    private renderGrid() {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                this.renderCell(j, i, this.cells[i][j]);
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
                player.graphic.zIndex = 1;
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

        // bomb.graphic.clear();
        // bomb.graphic
        //     .beginFill(0x3A3B3C)
        //     .drawCircle(
        //         (0.5 + bomb.position.x) * cellWidth,
        //         (0.5 + bomb.position.y) * cellWidth,
        //         cellWidth / 3
        //     )
        //     .endFill();

        if (!bomb.addedToCanvas) {
            bomb.addedToCanvas = true;
            const sheet = this.app.loader.resources['bomb'].spritesheet;
            bomb.graphic = new PIXI.AnimatedSprite(sheet.animations['exploding']);
            bomb.graphic.width = cellWidth;
            bomb.graphic.height = cellWidth;
            bomb.graphic.animationSpeed = 0.3; 
            bomb.graphic.play();
            bomb.graphic.zIndex = 1;

            this.app.stage.addChild(bomb.graphic);
        }
        
        bomb.graphic.position.x = bomb.position.x * cellWidth;
        bomb.graphic.position.y = bomb.position.y * cellWidth;
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
        explosion.graphic.clear();
        for (let cellPos of explosion.affectedCells) {
            this.renderExplosionAtCell(explosion, cellPos.x, cellPos.y);
        }
    }

    getCellsAffectedByExplosion(centre: Position, radius: number): Position[] {

        const { height, width } = this.settings.map.props;
        let { x, y } = centre;
        let i = 0;
        let stopped = Array(4).fill(false).slice();
        let affectedCells: Position[] = [Object.assign({}, centre)];

        const handleNextCell = (dirIndex: number, nextPos: Position) => {
            if (this.cells[nextPos.y][nextPos.x].type === CellType.BRICK) {
                affectedCells.push(nextPos);
                stopped[dirIndex] = true;
            } else if (this.isBlocked(nextPos)) {
                stopped[dirIndex] = true;
            } else {
                affectedCells.push(nextPos);
            }
        }

        while (i < radius && !stopped.every(e => e == true)) {

            if (!stopped[0] && x + i < width) {
                handleNextCell(0, { x: x + i, y });
            }
            if (!stopped[1] && x - i >= 0) {
                handleNextCell(1, { x: x - i, y });
            }
            if (!stopped[2] && y + i < height) {
                handleNextCell(2, { x, y: y + i });
            }
            if (!stopped[3] && y - i >= 0) {
                handleNextCell(3, { x, y: y - i });
            }
            i++;
        }

        return affectedCells;
    }

    handleExplosion(explosion: Explosion) {
        for (let cellPos of explosion.affectedCells) {
            let cell = this.cells[cellPos.y][cellPos.x];
            if (cell.type === CellType.BRICK) {
                
                this.app.stage.removeChild(cell.graphic);
                this.cells[cellPos.y][cellPos.x] = this.createCell(CellType.OPEN, 'open');


                // Rerender
                this.renderCell(cellPos.x, cellPos.y, this.cells[cellPos.y][cellPos.x], true);
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
            this.fixedUpdate(timeNow);
        });
        this.renderPlayers(true);
        this.app.ticker.add(() => this.loop())
    }

    isBlocked(position: Position): boolean {
        const type = this.cells[position.y][position.x].type;
        return type === CellType.SOLID || type === CellType.BRICK;
    }

    getNextCell(position: Position, direction: Direction): Position {
        let { x, y } = position;
        if (direction === Direction.UP) {
            y -= 1;
        } else if (direction === Direction.DOWN) {
            y += 1;
        } else if (direction === Direction.LEFT) {
            x -= 1;
        } else if (direction === Direction.RIGHT) {
            x += 1;
        }
        return { x, y };
    }

    canMove(player: Player): boolean {
        if (player.inTransition) {
            return false;
        }
        return !this.isBlocked(this.getNextCell(player.cellPosition, player.movingDirection));
    }

    fixedUpdate(time: number) {

        for (let player of this.players) {
            
            // Apply bombs
            for (let [i, bomb] of player.bombs.entries()) {

                const shouldExplode = time >= bomb.timePlaced + bomb.timer * 1000;

                // Handle sliding
                if (bomb.isSliding) {
                    const delta = bomb.slidingSpeed  / this.settings.tickrate;
                    
                    if (bomb.slidingDirection === Direction.UP) {
                        bomb.position.y -= delta;
                    } else if (bomb.slidingDirection === Direction.DOWN) {
                        bomb.position.y += delta;
                    } else if (bomb.slidingDirection === Direction.LEFT) {
                        bomb.position.x -= delta;
                    } else if (bomb.slidingDirection === Direction.RIGHT) {
                        bomb.position.x += delta;
                    }

                    const closest = { x: Math.round(bomb.position.x), y: Math.round(bomb.position.y) };
                    const next = this.getNextCell(closest, bomb.slidingDirection);
                    if (this.isBlocked(next) || shouldExplode) {
                        if (Math.abs(bomb.position.x - closest.x) < delta && Math.abs(bomb.position.y - closest.y) < delta) {
                            bomb.isSliding = false;
                            bomb.position = closest;
                        }
                    }
                }

                // Explode
                if (shouldExplode && !bomb.isSliding) {

                    const explosion = {
                        graphic: new Graphics(),
                        addedToCanvas: false,
                        center: bomb.position,
                        radius: bomb.explosionRadius,
                        duration: bomb.explosionDuration,
                        affectedCells: this.getCellsAffectedByExplosion(bomb.position, bomb.explosionRadius),
                        timeCreated: time,
                    };
                    
                    // Remove destroyed blocks / items
                    this.explosions.push(explosion);
                    this.handleExplosion(explosion);

                    // Remove bomb
                    player.bombs.splice(i, 1);
                    this.app.stage.removeChild(bomb.graphic);
                }
            }

            // Handle explosions
            for (let [i, explosion] of this.explosions.entries()) {
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

                // If target cell contains bomb, slide
                const nextPos = this.getNextCell(player.position, player.moveTransitionDirection);
                for (let player of this.players) {
                    for (let bomb of player.bombs) {
                        if (bomb.position.x === nextPos.x && bomb.position.y === nextPos.y) {

                            // Check if bomb can slide
                            const bombNextPos = this.getNextCell(bomb.position, player.moveTransitionDirection);
                            if (!this.isBlocked(bombNextPos)) {

                                bomb.isSliding = true;
                                bomb.slidingDirection = player.moveTransitionDirection;
                            }
                        }
                    }
                }
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