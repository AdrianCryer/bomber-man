import Entity from "../entities/entity";
import entity, { Behaviour } from "../entities/entity";
import match from "../room";


export default class Damagable implements Behaviour {

    health: number;
    destroyOnDeath: boolean;
    invulnerable: boolean;
    invulerableTo: Set<string>;
    killer: Entity;

    constructor(initialHealth: number, destroyOnDeath?: boolean) {
        this.invulnerable = false;
        this.health = initialHealth;
        this.destroyOnDeath = destroyOnDeath || false;
        this.invulerableTo = new Set();
    }

    onUpdate(entity: entity, match: match, time: number) {
        if (this.invulnerable) {
            return;
        }
        if (this.isDead() && this.destroyOnDeath) {
            match.removeEntity(entity);
        }
    }

    modifyHealth(delta: number, source?: Entity) {
        // This also includes positive health changes
        if (!this.invulnerable && (!source || !this.invulerableTo.has(source.id))) {
            this.health += delta;
        }
        if (!this.killer && source && this.isDead()) {
            this.killer = source;
        }
    }

    isDead() {
        return this.health <= 0;
    }

    setInvulnerable(state: boolean) {
        this.invulnerable = state;
    }

    setInvulnerableTo(entity: Entity) {
        this.invulerableTo.add(entity.id);
    }

    getKiller(): Entity {
        return this.killer;
    }
}