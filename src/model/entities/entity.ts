import { Position } from "../../util/types";
import Match from "../match";


export interface Behaviour {
    onUpdate: (entity: Entity, match: Match, time: number) => void;
}

export interface BehaviourClass<T extends Behaviour> {
    readonly name: string;
    new (...args: unknown[]): T;
}

export default abstract class Entity {

    readonly behaviours: { [tag: string]: Behaviour; } = {};
    readonly id: string;
    position: Position;
    isCollidable: boolean;

    constructor(id: string, position: Position, isCollidable: boolean) {
        this.id = id;
        this.position = position;
        this.isCollidable = isCollidable;
    }

    /**
     * Method to be preformed on a gamestate update.
     * 
     * @param match The match to update
     * @param time The current game time
     * @returns List of entity strings that have been modified since the last 
     *          game state.
     */
    abstract onUpdate(match: Match, time: number): void;

    hasComponent<B extends Behaviour>(cls: BehaviourClass<B>): boolean {
        return this.getBehaviour(cls) !== null;
    }

    getBehaviour<B extends Behaviour>(cls: BehaviourClass<B>): B {
        const behaviour = this.behaviours[cls.name];
        if (!behaviour) {
            return null;
        }
        return behaviour as B;
    }

    addBehaviour<B extends Behaviour>(object: B) {
        const tag = object.constructor.name;
        const behaviour = this.behaviours[tag];
        if (behaviour) {
            throw new Error("Behaviour already exists on the class exists");
        }
        this.behaviours[tag] = object;
    }
}