import * as PIXI from "pixi.js";
import { Graphics } from "pixi.js";
import { CellType } from "./game-map";
import Player, { Direction } from "./player";
import { RandomAIInputController, UserInputController } from "./player-controller";
import { GameSettings, Position, PowerUpType } from "./types";


export type Bomb = {
    owner: Player;
    power: number;
    timePlaced: number;
    timer: number;
    explosionRadius: number;
    explosionDuration: number;
    position: Position;
    isSliding: boolean;
    slidingSpeed: number;
    slidingDirection?: Direction;
};

export type PowerUp = {
    position: Position;
    type: PowerUpType;
};

export type ExplosionCell = {
    direction: Direction;
    position: Position;
    intensity: number;
    isEnd: boolean;
    isCentre: boolean;
};

export type Explosion = {
    center: Position;
    radius: number;
    duration: number;
    timeCreated: number;
    cells: ExplosionCell[];
};

export type GridCell = {
    type: CellType;
    bombs: Bomb[];
    explosionsCells: ExplosionCell[];
    powerups: PowerUp[];
};

export default class Game {

    settings: GameSettings;
    grid: GridCell[][];
    players: Player[];
    bombs: Bomb[];
    explosions: Explosion[];
    started: boolean;

    constructor(settings: GameSettings) {
        this.settings = settings;
        this.grid = [];
        this.players = [];
        this.bombs = [];
        this.explosions = [];

        this.setup();
    }

    setup() {
        
        // Set initial positions
        const startingPositions = this.settings.map.startingPositions;

        // Setup grid
        const { height, width } = this.settings.map.props;
        this.grid = [];
        for (let i = 0; i < height; i++) {
            this.grid[i] = new Array(width);
        }

        // Load map
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                this.grid[i][j] = this.createCell(this.settings.map.getCell(i, j));
            }
        }

        // spawn bricks
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {

                if (this.grid[i][j].type === CellType.OPEN && 
                    Math.random() <= this.settings.brickSpawnChance) {
                    this.grid[i][j] = this.createCell(CellType.BRICK);
                }
            }
        }

        // Add human player
        this.players.push(new Player(
            0, 
            new Graphics(),
            new UserInputController(),
            {
                position: startingPositions[0],
                stats: Object.assign({}, this.settings.detaultStats)
            }
        ));

        // Add bots
        for (let i = 0; i < this.settings.bots; i++) {
            this.players.push(
                new Player(
                    i + 1,
                    new Graphics(),
                    new RandomAIInputController(),
                    {
                        position: startingPositions[i + 1],
                        stats: Object.assign({}, this.settings.detaultStats)
                    }
                )
            )
        }
    }

    createCell(type: CellType): GridCell {
        return {
            type,
            bombs: [],
            explosionsCells: [],
            powerups: []
        }
    }

    getCell(position: Position): GridCell {
        return this.grid[position.y][position.x];
    }

    positionIsInBounds(position: Position): boolean {
        const { width, height } = this.settings.map.props;
        return 0 <= position.x && position.x < width && 0 <= position.y && position.y < height;
    }

    positionIsBlocked(position: Position): boolean {
        const type = this.grid[position.y][position.x].type;
        return type === CellType.SOLID || type === CellType.BRICK;
    }

    positionIsTraversable(position: Position): boolean {
        return !this.positionIsBlocked(position) && 
                this.getCell(position).bombs.length == 0;
    }

    getNextPosition(position: Position, direction: Direction, delta: number = 1): Position {
        let { x, y } = position;
        if (direction === Direction.UP) {
            y -= delta;
        } else if (direction === Direction.DOWN) {
            y += delta;
        } else if (direction === Direction.LEFT) {
            x -= delta;
        } else if (direction === Direction.RIGHT) {
            x += delta;
        }
        return { x, y };
    }

    removeBomb(bomb: Bomb) {
        let i = this.bombs.indexOf(bomb);
        if (i != - 1) 
            this.bombs.splice(i, 1);
        i = this.getCell(bomb.position).bombs.indexOf(bomb);
        if (i != -1)
            this.getCell(bomb.position).bombs.splice(i, 1);
    }

    removeExplosion(explosion: Explosion) {

    }

    calculateExplosionCells(source: Bomb): ExplosionCell[] {

        const radius = source.explosionRadius;
        let { x, y } = source.position;
        let i = 1;
        let stopped = Array(4).fill(false).slice();

        let cells: ExplosionCell[] = [{
            intensity: source.power,
            position: Object.assign({}, source.position),
            isEnd: false,
            isCentre: true,
            direction: -1,
        }];

        const handleNextCell = (direction: Direction, position: Position) => {

            if (stopped[direction]) {
                return;
            }

            const cell = {
                direction,
                position: position,
                intensity: source.power,
                isCentre: false,
            };

            let isStopping = (i === radius- 1);
            if (i < radius- 1) {
                const next = this.getNextPosition(position, direction);
                if (!this.positionIsInBounds(next) || this.getCell(next).type === CellType.SOLID) {
                    isStopping = true;
                }
            } else if (this.getCell(position).type === CellType.BRICK) {
                isStopping = true;
            }

            if (isStopping) {
                stopped[direction] = true;
            }
            cells.push({ ...cell, isEnd: isStopping });
        }

        while (i < radius && !stopped.every(e => e == true)) {
            handleNextCell(Direction.RIGHT, { x: x + i, y });
            handleNextCell(Direction.LEFT, { x: x - i, y });
            handleNextCell(Direction.DOWN, { x, y: y + i });
            handleNextCell(Direction.UP, { x, y: y - i });
            i++;
        }

        return cells;
    }

    createExplosion(source: Bomb, time: number) {
        const cells = this.calculateExplosionCells(source);
        const explosion = {
            center: source.position,
            radius: source.explosionRadius,
            duration: source.explosionDuration,
            timeCreated: time,
            cells
        } as Explosion;

        this.explosions.push(explosion);
        for (let cell of cells) {
            this.getCell(cell.position).explosionsCells.push(cell);
        }
    }

    start() {
        this.started = true;
    }

    updateBombs(time: number) {
        for (let [i, bomb] of this.bombs.entries()) {

            const { slidingDirection } = bomb;

            const shouldExplode = (time >= bomb.timePlaced + bomb.timer);
            if (bomb.isSliding) {
                const delta = bomb.slidingSpeed / this.settings.tickrate;
                
                bomb.position = this.getNextPosition(bomb.position, slidingDirection, delta);
                const closest = { 
                    x: Math.round(bomb.position.x), 
                    y: Math.round(bomb.position.y) 
                };
                const next = this.getNextPosition(closest, slidingDirection);

                if (shouldExplode || 
                    (closest.x !== bomb.position.x || closest.y !== bomb.position.y) &&
                    !this.positionIsTraversable(next)) {
                        
                    // Force to next cell
                    if (Math.abs(bomb.position.x - closest.x) <= delta && 
                        Math.abs(bomb.position.y - closest.y) <= delta) {

                        bomb.isSliding = false;
                        bomb.position = closest;
                    }
                }
            }

            if (shouldExplode && !bomb.isSliding) {
                this.createExplosion(bomb, time);
                this.removeBomb(bomb);
            }
        }
    }

    updatePlayerMovement(time: number) {

    }

    updateExplosions(time: number) {
        for (let [i, explosion] of this.explosions.entries()) {
            if (time >= explosion.timeCreated + explosion.duration * 1000) {

                this.explosions.splice(i, 1);
                for (let cell of explosion.cells) {
                    let i = this.getCell(cell.position).explosionsCells.indexOf(cell);
                    if (i != -1) {
                        this.getCell(cell.position).explosionsCells.splice(i, 1);
                    }
                }
            }
        }
    }

    updateCellState(time: number) {

    }

    // Fixed update
    update(time: number) {

        this.updateBombs(time);

        for (let player of this.players) {

        }
    }
}