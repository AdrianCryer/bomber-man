import shortUUID from "short-uuid";
import { Direction, Position } from "../../util/types";
import Damagable from "../behaviours/damagable";
import { CellType } from "../game-map";
import Match from "../match";
import Brick from "./brick";
import Entity from "./entity";

export type ExplosionCell = {
    id: string;
    direction: Direction;
    position: Position;
    intensity: number;
    isEnd: boolean;
    isCentre: boolean;
};

export type ExplosionConfig = {
    intensity: number;
    radius: number;
    duration: number;
    timeCreated: number;
};

export default class Explosion extends Entity {
    
    config: ExplosionConfig;
    cells: ExplosionCell[];
    affectedEntities: Set<string>;

    constructor(id: string, position: Position, config: ExplosionConfig) {
        super(id, position, false);
        this.config = config;
        this.cells = [];
        this.affectedEntities = new Set();
    }

    calculateExplosionCells(match: Match) {

        const { radius, intensity } = this.config;

        let { x, y } = this.position;
        let i = 0;
        let stopped = Array(4).fill(false).slice();

        this.cells = [{
            id: shortUUID.generate(),
            intensity,
            position: this.position,
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
                intensity,
                isCentre: false,
            };
            let isStopping = (i === radius - 1);
            if (i < radius - 1) {
                const next = position.getNextPosition(direction);
                if (!match.positionIsInBounds(next) || match.getCell(next).type === CellType.SOLID) {
                    isStopping = true;
                }
            } 

            for (let entity of match.getEntitiesAtPosition(position)) {
                if (entity instanceof Brick) {
                    isStopping = true;
                    break;
                }
            }

            if (isStopping) {
                stopped[direction] = true;
            }
            if (i !== 0) {
                this.cells.push({ ...cell, isEnd: isStopping });
            }
        }

        while (i < radius && !stopped.every(e => e == true)) {
            handleNextCell(Direction.RIGHT, new Position(x + i, y));
            handleNextCell(Direction.LEFT, new Position(x - i, y));
            handleNextCell(Direction.DOWN, new Position(x,y + i));
            handleNextCell(Direction.UP, new Position(x,y - i));
            i++;
        }
    }

    onUpdate(match: Match, time: number): void {

        if (time < this.config.timeCreated + this.config.duration * 1000) {
            for (let cell of this.cells) {
                for (let entity of match.getEntitiesWithBehaviourAtPosition(Damagable, cell.position)) {
                    if (!this.affectedEntities.has(entity.id)) {
                        entity.getBehaviour(Damagable).modifyHealth(-100, this);
                        this.affectedEntities.add(entity.id);
                    }
                }
            }
        } else {
            match.removeEntity(this);
        }
    }
}