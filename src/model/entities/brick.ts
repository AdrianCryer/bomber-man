import shortUUID from "short-uuid";
import Position from "../../util/Position";
import Damagable from "../behaviours/damagable";
import match from "../match";
import Entity from "./entity";
import Explosion from "./explosion";
import Powerup from "./powerup";


export default class Brick extends Entity {

    constructor(id: string, position: Position) {
        super(id, position, true);
        this.addBehaviour(new Damagable(100, true));
    }

    onUpdate(match: match, time: number): void {

        // Spawn powerup
        const damageComponent = this.getBehaviour(Damagable);
        if (damageComponent.isDead() && Math.random() < match.settings.powerupSpawnChance) {

            const maxRarity = Math.max(...match.settings.powerups.map(p => p.rarity));
            const powerupTier = match.settings.powerupRarityStepFunction(maxRarity, Math.random());
            const allPowerups = match.settings.powerups.filter(p => p.rarity === powerupTier);

            const powerup = new Powerup(
                shortUUID.generate(),
                this.position,
                allPowerups[Math.floor(Math.random() * allPowerups.length)]
            );
            const killer = damageComponent.getKiller();
            if (killer instanceof Explosion) {
                powerup.getBehaviour(Damagable).setInvulnerableTo(killer);
            }
            match.createEntity(powerup);
        }

        // Remove after if dead
        damageComponent.onUpdate(this, match, time);
    }
}