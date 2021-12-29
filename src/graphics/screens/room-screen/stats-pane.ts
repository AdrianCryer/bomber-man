import * as PIXI from "pixi.js";
import Player from "../../../model/entities/player";
import { StatType } from "../../../model/types";
import { Resources } from "../../../util/types";
import { AbsoluteContainer } from "../../absolute-container";

const STATS_FONT_SIZE = 18;
const ICON_GAP = 5;
const fontStyle = new PIXI.TextStyle({
    fontFamily: "oldschool",
    fontStyle: "normal",
    fill: '#FFFFFF',
    dropShadow: true,
    dropShadowAngle: 0.57,
    dropShadowDistance: 3,
    fontSize: STATS_FONT_SIZE,
    strokeThickness: 3
});

export default class StatsPane extends AbsoluteContainer {

    private labels: Record<string, PIXI.Text>;
    private resources: Resources;

    constructor(resources: Resources) {
        super();
        this.resources = resources;
        this.labels = {};
    }

    mutate(player: Player) {

        const stats = Object.keys(player.stats).sort();
        const centre = this.getBounds().height / 2 + this.getBounds().y;
        const startingPx = centre - stats.length * 1.2 * STATS_FONT_SIZE / 2;
        const centreX = this.getBounds().x + this.getBounds().width / 2;
        
        let maxWidth = 0;
        for (let stat of stats) {
            const value = player.stats[stat as StatType].toString();
            maxWidth = Math.max(maxWidth, PIXI.TextMetrics.measureText(value, fontStyle).width);
        }

        for (let [i, stat] of stats.entries()) {

            const centreY = startingPx + i * STATS_FONT_SIZE * 1.3;

            if (!(stat in this.labels)) {
                this.labels[stat] = new PIXI.Text("0", fontStyle);
                this.labels[stat].style.fontSize = STATS_FONT_SIZE + 2;
                this.labels[stat].anchor.set(0, 0.5);
                const icon = new PIXI.Graphics();
                icon.clear()
                    .beginFill(0x006ee6)
                    .lineStyle({ width: 2, color: 0x262626 })
                    .drawRoundedRect(
                        centreX - (STATS_FONT_SIZE + maxWidth) / 2,
                        centreY - STATS_FONT_SIZE / 2 - 1, 
                        STATS_FONT_SIZE, 
                        STATS_FONT_SIZE, 
                        5
                    )
                    .endFill();
                
                this.addChild(icon);
                this.addChild(this.labels[stat]);
            }

            this.labels[stat].text = player.stats[stat as StatType].toString();
            this.labels[stat].position.set(
                centreX + (STATS_FONT_SIZE - maxWidth) / 2 + ICON_GAP, 
                centreY + 1
            );
        }
    }
}