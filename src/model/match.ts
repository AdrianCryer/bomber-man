import shortUUID from "short-uuid";
import Position from "../util/Position";
import Bot from "./entities/bot";
import Entity, { Behaviour, BehaviourClass } from "./entities/entity";
import GameMap, { CellType } from "./game-map";
import Player from "./entities/player";
import { Direction, PowerUpType, StatsConfig, StatType } from "./types";
import Explosion from "./entities/explosion";
import { Slidable } from "./behaviours/slidable";
import Brick from "./entities/brick";

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

export type GridCell = {
    id: string;
    type: CellType;
    entities: Set<string>;
};

export default class Match {

    entitities: Record<string, Entity>;
    settings: MatchSettings;
    playerIds: string[];
    grid: GridCell[][];
    players: Set<string>;
    bots: Set<string>;

    /** Number of elapsed ticks */
    time: number;

    constructor(settings: MatchSettings, playerIds: string[]) {
        this.settings = settings;
        this.playerIds = playerIds;
        this.grid = [];
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
                    
                    this.createEntity(new Brick(shortUUID.generate(), new Position(x, y)))
                    // this.grid[y][x] = this.createCell(CellType.BRICK);
                }
            }
        }

        // Add human player
        for (let [i, playerId] of this.playerIds.entries()) {
            this.players.add(playerId);
            this.createEntity(new Player(
                playerId,
                startingPositions[i],
                Object.assign({}, this.settings.detaultStats)
            ));
        }

        // Add bots
        for (let i = 0; i < this.settings.bots; i++) {
            const id = shortUUID.generate();
            this.bots.add(id);
            this.createEntity(new Bot(
                id,
                startingPositions[numPlayers + i].clone(),
                Object.assign({}, this.settings.detaultStats)
            ));
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

    createCell(type: CellType): GridCell {
        return {
            id: shortUUID.generate(),
            type,
            entities: new Set()
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
        return this.grid[position.y][position.x].type === CellType.SOLID;
    } 

    positionIsTraversable(position: Position): boolean {
        if (this.positionIsBlocked(position)) {
            return false;
        }
        const { x,y } = position;
        for (let entityId of this.grid[y][x].entities) {
            if (this.entitities[entityId].isCollidable) {
                return false;
            }
        }
        return true;
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
        let result = [];
        for (let entity of Object.values(this.entitities)) {
            if (entity.hasComponent(cls)) {
                result.push(entity);
            }
        }
        return result;
    }

    getEntitiesWithBehaviourAtPosition<B extends Behaviour>(cls: BehaviourClass<B>, position: Position): Entity[] {
        const { x,y } = position;
        let result = [];
        for (let id of Array.from(this.grid[y][x].entities)) {
            const entity = this.entitities[id];
            if (entity.hasComponent(cls)) {
                result.push(entity);
            }
        }
        return result;
    }

    getEntitiesAtPosition(position: Position): Entity[] {
        const { x,y } = position;
        return Array.from(this.grid[y][x].entities).map(id => this.entitities[id]);
    }

    updateEntityPosition(entity: Entity, lastPosition: Position) {
        const { x,y } = lastPosition.round();
        this.grid[y][x].entities.delete(entity.id);

        const { x: nextX, y: nextY } =  entity.position.round();
        this.grid[nextY][nextX].entities.add(entity.id);
    }

    removeEntity(entity: Entity) {
        const { x, y } = entity.position.round();
        this.grid[y][x].entities.delete(entity.id);

        const id = entity.id;
        delete this.entitities[id];
    }

    createEntity(entity: Entity) {
        this.entitities[entity.id] = entity;
        const { x, y } = entity.position.round();
        this.grid[y][x].entities.add(entity.id);
    }

    // Fixed update
    mutate(time: number) {
        this.time = time;
 
        for (let entity of Object.values(this.entitities)) {
            entity.onUpdate(this, time);
        }
    }
}