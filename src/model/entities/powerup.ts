import { Position } from "../../util/types";
import Damagable from "../behaviours/damagable";
import Room from "../room";
import { StatType } from "../types";
import Entity from "./entity";

export type PowerUpType = {
    name: string;
    stat: StatType;
    delta: number;
    rarity: number;
};

export default class Powerup extends Entity {

    type: PowerUpType;

    constructor(id: string, position: Position, type: PowerUpType) {
        super(id, position, false);
        this.type = type;
        this.addBehaviour(new Damagable(100, true));
    }

    onUpdate(match: Room, time: number): void {
        this.getBehaviour(Damagable).onUpdate(this, match, time);
    }
}