import Position from "../../util/Position";
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
    id: string;
    position: Position;

    constructor(id: string, position: Position) {
        this.id = id;
        this.position = position;
    }

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