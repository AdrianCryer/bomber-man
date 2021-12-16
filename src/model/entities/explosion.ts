import shortUUID from "short-uuid";
import Position from "../../util/Position";
import { Slidable } from "../behaviours/slidable";
import { CellType } from "../game-map";
import Match from "../match";
import { Direction } from "../types";
import { BombConfig } from "./bomb";
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

    constructor(id: string, position: Position, config: ExplosionConfig) {
        super(id, position);
        this.config = config;
        this.cells = [];
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
                const next = match.getNextPosition(position, direction);
                if (!match.positionIsInBounds(next) || match.getCell(next).type === CellType.SOLID) {
                    isStopping = true;
                }
            } 
            if (match.getCell(position).type === CellType.BRICK) {
                isStopping = true;
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
            // for (let entity of match.getEntitiesWithBehaviourAtPosition(Damagable, this.position)) {

            // }
        } else {
            match.removeEntity(this);
        }

        // for (let entity of match.get)

        // const shouldExplode = (time >= this.config.timePlaced + this.config.timer * 1000);
        // if (!shouldExplode) {
        //     this.getBehaviour(Slidable).onUpdate(this, match, time);
        // }
    }
}