import { CellType } from "./game-map";
import Player from "./player";
import { Direction, GameSettings, Position, PowerUpType, StatsConfig } from "./types";


export type PlayerConfig = {
    position: Position;
    stats: StatsConfig;
};

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
    players: Player[];
};

export default class Game {

    settings: GameSettings;
    grid: GridCell[][];
    players: Player[];
    bombs: Bomb[];
    powerups: PowerUp[];
    explosions: Explosion[];
    started: boolean;

    /** Number of elapsed ticks */
    time: number;

    constructor(settings: GameSettings) {
        this.settings = settings;
        this.grid = [];
        this.players = [];
        this.bombs = [];
        this.explosions = [];
        this.time = 0;

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
            {
                initialPosition: startingPositions[0],
                stats: Object.assign({}, this.settings.detaultStats)
            }
        ));

        // Add bots
        for (let i = 0; i < this.settings.bots; i++) {
            this.players.push(
                new Player(
                    i + 1,
                    {
                        initialPosition: startingPositions[i + 1],
                        stats: Object.assign({}, this.settings.detaultStats)
                    }
                )
            )
        }

        for (let player of this.players) {
            player.isAlive = true;
            this.getCell(player.position).players.push(player);
        }
    }

    createCell(type: CellType): GridCell {
        return {
            type,
            bombs: [],
            explosionsCells: [],
            powerups: [],
            players: []
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

    createBomb(player: Player, position: Bomb) {

    }

    removeBomb(bomb: Bomb) {
        let i = this.bombs.indexOf(bomb);
        if (i !== - 1)
            this.bombs.splice(i, 1);
        i = this.getCell(bomb.position).bombs.indexOf(bomb);
        if (i != -1)
            this.getCell(bomb.position).bombs.splice(i, 1);
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
        this.handleExplosion(explosion);
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

            let isStopping = (i === radius - 1);
            if (i < radius - 1) {
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
    
    handleExplosion(explosion: Explosion) {
        for (let explosionCell of explosion.cells) {
            let pos = explosionCell.position;
            let cell = this.getCell(pos);
            if (cell.type === CellType.BRICK) {
                
                // Try spawn power up at center 
                if (Math.random() < this.settings.powerupSpawnChance) {
                    this.createPowerup(pos);
                }

                this.grid[pos.y][pos.x] = this.createCell(CellType.OPEN);
            }
        }
    }

    removeExplosion(explosion: Explosion) {
        let i = this.explosions.indexOf(explosion);
        if (i !== - 1)
            this.explosions.splice(i, 1);

        for (let cell of explosion.cells) {
            i = this.getCell(cell.position).explosionsCells.indexOf(cell);
            if (i != -1) {
                this.getCell(cell.position).explosionsCells.splice(i, 1);
            }
        }
    }

    createPowerup(position: Position) {
        const maxRarity = Math.max(...this.settings.powerups.map(p => p.rarity));
        const powerupTier = this.settings.powerupRarityStepFunction(maxRarity, Math.random());
        const allPowerups = this.settings.powerups.filter(p => p.rarity === powerupTier);
        console.log("SPAWNING TIER", powerupTier, maxRarity);

        const powerup = {
            position,
            type: allPowerups[Math.floor(Math.random() * allPowerups.length)],
        };
        this.powerups.push(powerup);
        this.getCell(position).powerups.push(powerup);
    }

    removePowerup(powerup: PowerUp) {
        const currentCell = this.getCell(powerup.position);
        let i = this.powerups.indexOf(powerup);
        if (i !== -1) {
            this.powerups.splice(i, 1);
        }
        i = currentCell.powerups.indexOf(powerup);
        currentCell.powerups.splice(i, 1);
    }

    updatePlayerPosition(player: Player, nextPos: Position) {
        const currentCell = this.getCell(player.position);
        let i = currentCell.players.indexOf(player);
        if (i != -1) {
            currentCell.players.splice(i, 1);
        }
        player.position = nextPos;
        this.getCell(nextPos).players.push(player);
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

    updatePlayerMovement(player: Player) {
        if (!player.isAlive) {
            return;
        }

        const { inTransition, wantsToMove, movingDirection, position } = player;
        if (!inTransition && wantsToMove) {

            const nextPos = this.getNextPosition(position, movingDirection);
            if (!this.positionIsBlocked(nextPos)) {

                let canMove = true;
                const bombs = this.getCell(nextPos).bombs;

                // Position contains bomb: can only move if can slide bomb
                if (bombs.length > 0) {
                    const bombNextPos = this.getNextPosition(nextPos, movingDirection);
                    canMove = this.positionIsTraversable(bombNextPos);

                    if (canMove) {
                        for (let bomb of bombs) {
                            bomb.isSliding = true;
                            bomb.slidingDirection = movingDirection;
                        }
                    }
                }

                if (canMove) {
                    player.moveTransitionPercent = 0;
                    player.moveTransitionDirection = movingDirection;
                    player.inTransition = true;
                }
            }
        }

        // Interpolate if in transition
        if (player.inTransition) {

            player.moveTransitionPercent += player.stats.speed / this.settings.tickrate;
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
                const nextPos = {
                    x: Math.round(player.position.x),
                    y: Math.round(player.position.y)
                };
                player.inTransition = false;
                player.cellPosition = nextPos;
            }
        }
    }

    updateExplosions(time: number) {
        for (let [i, explosion] of this.explosions.entries()) {
            if (time >= explosion.timeCreated + explosion.duration * 1000) {
                this.removeExplosion(explosion);
            }
        }
    }

    updateCellState(time: number) {
        const { width, height } = this.settings.map.props;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {

                const cell = this.grid[i][j];

                // Check for explosion death
                if (cell.explosionsCells.length !== 0) {
                    for (let player of cell.players) {
                        player.isAlive = false;
                    }
                }

                // Apply powerups
                if (cell.players.length !== 0) {
                    let player = cell.players[0];
                    for (let powerup of cell.powerups) {
                        player.stats[powerup.type.stat] += powerup.type.delta;
                        this.removePowerup(powerup);
                    }
                }
            }
        }
    }

    // Fixed update
    update(time: number) {
        this.updateBombs(time);
        this.updateExplosions(time);

        for (let player of this.players) {
            this.updatePlayerMovement(player)
        }

        this.updateCellState(time);

        this.time += 1;
    }
}