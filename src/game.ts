import * as PIXI from "pixi.js";
import { Graphics, Sprite } from "pixi.js";
import GameMap, { CellType } from "./game-map";
import Player, { Bomb, Direction } from "./player";
import { RandomAIInputController, UserInputController } from "./player-controller";
import { GameSettings, Position } from "./types";

type Explosion = {
    graphic: Graphics;
    addedToCanvas: boolean;
    center: Position;
    radius: number;
    duration: number;
    timeCreated: number;
    affectedCells: ExplosionCell[];
};

type ExplosionCell = {
    graphic: Sprite;
    direction: Direction;
    position: Position;
    intensity: number;
    isEnd: boolean;
    isCentre: boolean;
    addedToCanvas: boolean;
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
        console.log(startingPositions)

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
                bombTimer: 3
            }
        ));

        // Add bots
        for (let i = 0; i < settings.bots; i++) {
            this.players.push(
                new Player(
                    i + 1,
                    new Graphics(),
                    new RandomAIInputController(),
                    {
                        position: settings.map.startingPositions[i + 1],
                        speed: settings.initialSpeed,
                        bombCount: 1,
                        bombExplosionRadius: 5,
                        bombExplosionDuration: 1,
                        bombTimer: 3
                    }
                )
            )
        } 

        console.log(this.players);
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

    private renderExplosionCell(explosionCell: ExplosionCell) {
        const { height: mapHeight, width: mapWidth } = this.settings.map.props;
        const cellWidth = Math.min(
            this.app.screen.width / mapWidth,
            this.app.screen.height / mapHeight,
        );

        if (!explosionCell.addedToCanvas) {
            explosionCell.addedToCanvas = true;
            const sheet = this.app.loader.resources['explosion'].spritesheet;
            console.log(sheet)
            let code = 'base';
            if (explosionCell.isCentre) {
                code = 'centre';
            } else if (explosionCell.isEnd) {
                code = 'end';
            }

            const texture = sheet.textures[`explosion-${code}-${explosionCell.intensity}`];
            explosionCell.graphic = new PIXI.Sprite(texture);
            explosionCell.graphic.width = cellWidth;
            explosionCell.graphic.height = cellWidth;
            explosionCell.graphic.zIndex = 1;
                        
            explosionCell.graphic.pivot.set(
                texture.width / 2, 
                texture.height / 2
            );
            if (explosionCell.direction === Direction.UP) {
                explosionCell.graphic.angle = 270;
            }
            if (explosionCell.direction === Direction.DOWN) {
                explosionCell.graphic.angle = 90;
            }

            explosionCell.graphic.position.set(
                (0.5 + explosionCell.position.x) * cellWidth,
                (0.5 + explosionCell.position.y) * cellWidth,
            )


            this.app.stage.addChild(explosionCell.graphic);
        }
    }

    renderExplosion(explosion: Explosion) {
        for (let explosionCell of explosion.affectedCells) {
            this.renderExplosionCell(explosionCell);
        }
    }

    getCellsAffectedByExplosion(centre: Position, radius: number, power: number): ExplosionCell[] {

        let { x, y } = centre;
        let i = 1;
        let stopped = Array(4).fill(false).slice();
        let affectedCells: ExplosionCell[] = [{
            graphic: null,
            intensity: power,
            position: Object.assign({}, centre),
            isEnd: false,
            isCentre: true,
            direction: -1,
            addedToCanvas: false
        }];

        const handleNextCell = (direction: Direction, nextPos: Position) => {

            if (stopped[direction] || !this.positionIsInBounds(nextPos)) {
                return;
            }

            let cell = {
                graphic: null as PIXI.Sprite,
                direction,
                position: nextPos,
                intensity: power,
                isCentre: false,
                addedToCanvas: false
            };

            if (this.cells[nextPos.y][nextPos.x].type === CellType.BRICK) {
                affectedCells.push({...cell, isEnd: true});
                stopped[direction] = true;
            } else if (this.positionIsBlocked(nextPos)) {
                stopped[direction] = true;
            } else {
                affectedCells.push({...cell, isEnd: (i === radius - 1)});
            }
        }

        while (i < radius && !stopped.every(e => e == true)) {
            handleNextCell(Direction.RIGHT, { x: x + i, y });
            handleNextCell(Direction.LEFT, { x: x - i, y });
            handleNextCell(Direction.DOWN, { x, y: y + i });
            handleNextCell(Direction.UP, { x, y: y - i });
            i++;
        }

        console.log(affectedCells);
        return affectedCells;
    }

    handleExplosion(explosion: Explosion) {
        for (let explosionCell of explosion.affectedCells) {
            let pos = explosionCell.position;
            let cell = this.cells[pos.y][pos.x];
            if (cell.type === CellType.BRICK) {
                
                this.app.stage.removeChild(cell.graphic);
                this.cells[pos.y][pos.x] = this.createCell(CellType.OPEN, 'open');

                // Rerender
                this.renderCell(pos.x, pos.y, this.cells[pos.y][pos.x], true);
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

    positionIsInBounds(position: Position): boolean {
        const { width, height } = this.settings.map.props;
        return 0 <= position.x && position.x < width && 0 <= position.y && position.y < height;
    }

    positionIsTraversable(position: Position): boolean {
        return !this.positionIsBlocked(position) && !this.positionContainsBomb(position);
    }

    positionContainsBomb(position: Position): boolean {
        return this.getBombsAtPosition(position).length > 0;
    }

    positionIsBlocked(position: Position): boolean {
        const type = this.cells[position.y][position.x].type;
        return type === CellType.SOLID || type === CellType.BRICK;
    }

    getBombsAtPosition(position: Position): Bomb[] {
        let bombs = [];
        for (let player of this.players) {
            for (let bomb of player.bombs) {
                if (position.x === Math.round(bomb.position.x) && 
                    position.y === Math.round(bomb.position.y)) {
                    bombs.push(bomb);
                }
            }
        }
        return bombs;
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

                    if (shouldExplode || 
                        (closest.x !== bomb.position.x || closest.y !== bomb.position.y) &&
                        !this.positionIsTraversable(next)) {
                        
                        if (Math.abs(bomb.position.x - closest.x) <= delta && Math.abs(bomb.position.y - closest.y) <= delta) {
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
                        affectedCells: this.getCellsAffectedByExplosion(bomb.position, bomb.explosionRadius, 2),
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
                    for (let explosionCell of explosion.affectedCells) {
                        this.app.stage.removeChild(explosionCell.graphic);
                    }
                }
            }

            // Apply movement
            if (!player.inTransition && player.wantsToMove) {

                const nextPos = this.getNextCell(player.position, player.movingDirection);
                console.log(player.position);
                if (!this.positionIsBlocked(nextPos)) {
                    
                    let canMove = true;
                    const bombs = this.getBombsAtPosition(nextPos);

                    // Position contains bomb: can only move if can slide bomb
                    if (bombs.length > 0) {
                        const bombNextPos = this.getNextCell(nextPos, player.movingDirection);
                        canMove = this.positionIsTraversable(bombNextPos);

                        if (canMove) {
                            for (let bomb of bombs) {
                                bomb.isSliding = true;
                                bomb.slidingDirection = player.movingDirection;
                            }
                        }
                    }

                    if (canMove) {
                        player.moveTransitionPercent = 0;
                        player.moveTransitionDirection = player.movingDirection;
                        player.inTransition = true;
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