import shortUUID from "short-uuid";
import Position from "../util/Position";
import Bot from "./entities/bot";
import Entity, { Behaviour, BehaviourClass } from "./entities/entity";
import GameMap, { CellType } from "./game-map";
import Player from "./entities/player";
import { Direction, PowerUpType, StatsConfig, StatType } from "./types";

export type MatchSettings = {

    // The map to play
    map: GameMap;

    // Number of bots in the game
    bots: number;

    // Bot difficulty
    difficulty: 'easy' | 'medium' | 'hard';

    // Tickrate to preform fixed updates (i.e., movement)
    tickrate: number;

    // Percentage of brick spawns
    brickSpawnChance: number;

    // Chance that a powerup will spawn on breaking a brick
    powerupSpawnChance: number;

    // Permitted settings
    statsSettings: {
        [key in StatType]: { min: number, max: number }
    };

    // Settings of all of the starting players
    detaultStats: StatsConfig;

    // Types of powerups that can drop in the game.
    powerups: PowerUpType[];

    // Function to determine which tier of powerup to drop
    powerupRarityStepFunction: (maxRarity: number, val: number) => number;
};

export type PlayerConfig = {
    position: Position;
    stats: StatsConfig;
};

export type Bomb = {
    id: string;
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
    id: string;
    position: Position;
    type: PowerUpType;
};

export type ExplosionCell = {
    id: string;
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
    id: string;
    type: CellType;
    explosionsCells: ExplosionCell[];
    powerups: PowerUp[];
};

export default class Match {

    settings: MatchSettings;
    playerIds: string[];
    grid: GridCell[][];
    bombs: Bomb[];
    powerups: PowerUp[];
    explosions: Explosion[];
    players: Set<string>;
    bots: Set<string>;

    /** Number of elapsed ticks */
    time: number;
    entitities: Record<string, Entity>;

    constructor(settings: MatchSettings, playerIds: string[]) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.grid = [];
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];

        this.entitities = {};
        this.players = new Set();
        this.bots = new Set();

        this.setup();
    }

    setup() {

        // Set initial positions
        const startingPositions = this.settings.map.startingPositions;
        const numPlayers = this.playerIds.length;
        if (numPlayers > startingPositions.length) {
            throw new Error("Too many players for the chosen map.");
        } else if (numPlayers + this.settings.bots > startingPositions.length) {
            throw new Error("Too many bots for the chosen map.");
        }

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
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let skip = false;
                for (let startPos of startingPositions) {
                    if (Math.abs(startPos.x - x) < 2 && Math.abs(startPos.y - y) < 2) {
                        skip = true;
                        break;
                    }
                }
                if (skip) {
                    continue;
                }
                if (this.grid[y][x].type === CellType.OPEN &&
                    Math.random() <= this.settings.brickSpawnChance) {
                    this.grid[y][x] = this.createCell(CellType.BRICK);
                }
            }
        }

        // Add human player
        for (let [i, playerId] of this.playerIds.entries()) {
            this.players.add(playerId);
            this.entitities[playerId] = new Player(
                playerId,
                startingPositions[i],
                Object.assign({}, this.settings.detaultStats)
            );
        }

        // Add bots
        for (let i = 0; i < this.settings.bots; i++) {
            const id = shortUUID.generate();
            this.bots.add(id);
            this.entitities[id] = new Bot(
                id,
                startingPositions[numPlayers + i].clone(),
                Object.assign({}, this.settings.detaultStats)
            );
        }
    }

    getPlayer(playerId: string) {
        if (!this.players.has(playerId)) {
            throw new Error("Invalid player");
        }
        return this.entitities[playerId] as Player;
    }

    getPlayers(): Player[] {
        let players = [];
        for (let id of this.players.values()) {
            players.push(this.getPlayer(id));
        }
        return players;
    }

    createCell(type: CellType, last?: GridCell): GridCell {
        return {
            id: shortUUID.generate(),
            type,
            explosionsCells: last ? last.explosionsCells : [],
            powerups: last ? last.powerups : []
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
            this.getBombsInPosition(position).length == 0;
    }

    getNextPosition(position: Position, direction: Direction, delta: number = 1): Position {
        let nextPos = position.clone();
        if (direction === Direction.UP) {
            nextPos.y -= delta;
        } else if (direction === Direction.DOWN) {
            nextPos.y += delta;
        } else if (direction === Direction.LEFT) {
            nextPos.x -= delta;
        } else if (direction === Direction.RIGHT) {
            nextPos.x += delta;
        }
        return nextPos;
    }

    getEntitiesWithBehaviour<B extends Behaviour>(cls: BehaviourClass<B>): Entity[] {
        let entities = [];
        for (let entity of Object.values(this.entitities)) {
            if (entity.hasComponent(cls)) {
                entities.push(entity);
            }
        }
        return [];
    }

    getEntitiesWithBehaviourAtPosition<B extends Behaviour>(cls: BehaviourClass<B>, position: Position): Entity[] {
        let entities = [];
        for (let entity of Object.values(this.entitities)) {
            if (entity.hasComponent(cls)) {
                entities.push(entity);
            }
        }
        return [];
    }

    // getEntitiesOfType<E extends Entity>(cls: Class<E>): Entity[] {
    //     return [];
    // }

    // removeEntity() {
    //     // this.
    // }

    getBombsInPosition(position: Position): Bomb[] {
        let bombs: Bomb[] = [];
        for (let bomb of this.bombs) {
            if (Position.equals(bomb.position.round(), position)) {
                bombs.push(bomb);
            }
        }
        return bombs;
    }

    removeBomb(bomb: Bomb) {
        let i = this.bombs.indexOf(bomb);
        if (i !== - 1) {
            this.bombs.splice(i, 1);
        }
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
        let i = 0;
        let stopped = Array(4).fill(false).slice();

        let cells: ExplosionCell[] = [{
            id: shortUUID.generate(),
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
                id: shortUUID.generate(),
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
            } 
            if (this.getCell(position).type === CellType.BRICK) {
                isStopping = true;
            }

            if (isStopping) {
                stopped[direction] = true;
            }
            if (i !== 0) {
                cells.push({ ...cell, isEnd: isStopping });
            }
        }

        while (i < radius && !stopped.every(e => e == true)) {
            handleNextCell(Direction.RIGHT, new Position(x + i, y));
            handleNextCell(Direction.LEFT, new Position(x - i, y));
            handleNextCell(Direction.DOWN, new Position(x,y + i));
            handleNextCell(Direction.UP, new Position(x,y - i));
            i++;
        }

        return cells;
    }

    handleExplosion(explosion: Explosion) {
        for (let explosionCell of explosion.cells) {
            let pos = explosionCell.position;

            let cell = this.getCell(pos);
            
            // Destroy exploded powerups
            for (let powerup of cell.powerups) {
                this.removePowerup(powerup);
            }
            
            if (cell.type === CellType.BRICK) {

                // Try spawn power up at center 
                if (Math.random() < this.settings.powerupSpawnChance) {
                    this.createPowerup(pos);
                }

                this.grid[pos.y][pos.x] = this.createCell(CellType.OPEN, cell);
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
            id: shortUUID.generate(),
            position,
            type: allPowerups[Math.floor(Math.random() * allPowerups.length)],
        } as PowerUp;

        this.powerups.push(powerup);
        this.getCell(position).powerups.push(powerup);
    }

    removePowerup(powerup: PowerUp) {
        let currentCell = this.getCell(powerup.position);
        let i = this.powerups.indexOf(powerup);
        if (i !== -1) {
            this.powerups.splice(i, 1);
        }
        i = currentCell.powerups.indexOf(powerup);
        currentCell.powerups.splice(i, 1);
    }

    updateBombs(time: number) {
        for (let [i, bomb] of this.bombs.entries()) {

            const { slidingDirection } = bomb;

            const shouldExplode = (time >= bomb.timePlaced + bomb.timer * 1000);
            if (bomb.isSliding) {
                const delta = bomb.slidingSpeed / this.settings.tickrate;

                bomb.position = this.getNextPosition(bomb.position, slidingDirection, delta);
                const closest = bomb.position.round();
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

    updateCellState(time: number) {
        const { width, height } = this.settings.map.props;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const cell = this.grid[y][x];
                const pos = new Position(x, y);
                
                for (let player of Object.values(this.players)) {

                    if (Position.equals(player.position.round(), pos)) {
                        // Check for explosion death
                        if (cell.explosionsCells.length !== 0) {
                            player.isAlive = false;
                        }
                        for (let powerup of cell.powerups) {
                            player.stats[powerup.type.stat] += powerup.type.delta;
                            this.removePowerup(powerup);
                        }
                    }
                }
                for (let bot of Object.values(this.bots)) {

                    if (Position.equals(bot.position.round(), pos)) {
                        // Check for explosion death
                        if (cell.explosionsCells.length !== 0) {
                            bot.isAlive = false;
                        }
                        for (let powerup of cell.powerups) {
                            bot.stats[powerup.type.stat] += powerup.type.delta;
                            this.removePowerup(powerup);
                        }
                    }
                }
            }
        }
    }

    // Fixed update
    mutate(time: number) {
        this.time = time;
        this.updateBombs(time);

        for (let explosion of this.explosions) {
            if (time >= explosion.timeCreated + explosion.duration * 1000) {
                this.removeExplosion(explosion);
            }
        }

        for (let entity of Object.values(this.entitities)) {
            entity.onUpdate(this, time);
        }

        for (let bot of Object.values(this.bots)) {
            bot.onUpdate(this, time);
        }

        this.updateCellState(time);
    }
}