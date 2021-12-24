import * as PIXI from "pixi.js";
import Player from "../model/entities/player";
import { StatType } from "../model/types";
import { AbsoluteContainer } from "./absolute-container";
import { Resources } from "./match-grid";

// export type PlayerRow = {
//     position: number;
//     playerName: string;
//     playerStats: StatsConfig;
//     colour: number;
//     isAlive: boolean;
// };

const PLAYER_ROW_HEIGHT_RATIO = 0.1;
const PLAYER_ROW_OFFSET = 60;

const STAT_LABELS: Record<StatType, string> = {
    speed: 'Speed',
    explosionRadius: 'Bomb Range',
    explosionDuration: 'Bomb Duration',
    bombCount: 'Bombs',
    bombTimer: 'Bomb Timer'
};

type PlayerRowGraphic = {
    position: number;
    titleIcon: PIXI.Container;
    titleText: PIXI.Text;
    titleStrike?: PIXI.Graphics;
    statRows: {
        [stateName: string]: {
            icon: PIXI.Graphics;
            text: PIXI.Text;
        }
    }
    renderedDead: boolean;
}

export default class StatsBoard extends AbsoluteContainer {

    title: PIXI.Text;
    frame: PIXI.Graphics;
    resources: Resources;
    padding: number;
    players: Player[];
    playerRowGraphics: Record<string, PlayerRowGraphic>;

    constructor(resources: Resources, padding: number = 20) {
        super();
        this.resources = resources;
        this.padding = padding
        this.sortableChildren = true;
        this.playerRowGraphics = {};
        this.frame = new PIXI.Graphics();
        this.title = new PIXI.Text("STATS", {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: 20,
            fill: '#262626'
        });
        this.addChild(this.frame);
        this.addChild(this.title);
    }

    setBounds(bounds: PIXI.Rectangle) {
        super.setBounds(bounds);
        this.frame.clear();
        this.frame
            .beginFill(0xBABDBC)
            .lineStyle({ width: 1, color: 0x333 })
            .drawRect(0, 0, this.bounds.width, this.bounds.height)
            .endFill();
        
        this.title.x = this.bounds.width / 2 + this.padding;
        this.title.y = this.padding;
        this.title.anchor.x = 0.5 + (this.padding / this.bounds.width);

        this.position.set(this.bounds.x, this.bounds.y);
    }

    mutate(players: Player[]) {
        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;
        const rowsPerEntry = Object.keys(players[0].stats || {}).length + 2;

        // For each player, refresh the stats text
        for (let [i, player] of players.entries()) {

            const yOffset = rowsPerEntry * rowHeight * i + PLAYER_ROW_OFFSET;
            const id = player.id;
            
            if (!(id in this.playerRowGraphics)) {
                this.updatePlayerRowGraphic(player, i);
            } 
            
            const rowGraphic = this.playerRowGraphics[id];
            if (!player.isAlive() && !rowGraphic.renderedDead) {
                this.updatePlayerDead(player);
            }
            const titleText = rowGraphic.titleText;
            titleText.x = 1.5 * this.padding + rowHeight;
            titleText.position.set(1.5 * this.padding + rowHeight, yOffset);

            let titleIcon = this.playerRowGraphics[id].titleIcon;
            if (player.isAlive()) {
                (<PIXI.Graphics> titleIcon)
                    .clear()
                    .beginFill(0xEA4C46)
                    .lineStyle({ width: 2, color: 0x262626 })
                    .drawRoundedRect(this.padding, yOffset, rowHeight, rowHeight, 5)
                    .endFill();
            } else {
                titleIcon.position.set(this.padding, yOffset);
            }

            for (let [j, stat] of Object.keys(player.stats).entries()) {
                const yPos = yOffset + (j + 1) * rowHeight;

                const statText = rowGraphic.statRows[stat as string].text;
                statText.x = 1.5 * this.padding + rowHeight;
                statText.position.set(1.5 * this.padding + rowHeight, yPos);
                statText.text = player.stats[stat as StatType].toString();

                const statIcon = rowGraphic.statRows[stat as string].icon;
                statIcon
                    .clear()
                    .beginFill(0x006ee6)
                    .lineStyle({ width: 2, color: 0x262626 })
                    .drawRoundedRect(this.padding, yPos, rowHeight, rowHeight, 5)
                    .endFill();
            }
        }
    }

    updatePlayerRowGraphic(player: Player, position: number) {
        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;

        if (player.isAlive()) {
            const titleText =  new PIXI.Text("P" + (position + 1), {
                fontFamily: "oldschool",
                fontStyle: "normal",
                fontSize: `${rowHeight}px`,
                fill: '#262626'
            });
            const titleIcon = new PIXI.Graphics();
            this.addChild(titleText);
            this.addChild(titleIcon);

            const statRows: {
                [stateName: string]: { icon: PIXI.Graphics; text: PIXI.Text; }
            } = {};

            for (let stat of Object.keys(player.stats)) {

                const icon = new PIXI.Graphics();
                const text = new PIXI.Text(player.stats[stat as StatType].toString(), {
                    fontFamily: "arial",
                    fontStyle: "normal",
                    fontWeight: "800",
                    fontSize: `${Math.floor(rowHeight)}px`,
                    fill: '#262626'
                });

                this.addChild(icon);
                this.addChild(text);

                statRows[stat] = { icon, text };
            } 

            this.playerRowGraphics[player.id] = {
                position,
                titleIcon,
                titleText,
                statRows,
                renderedDead: false
            };
        }
    }

    // TODO: Assumes player is alive to begin with.
    updatePlayerDead(player: Player) {

        const rowGraphic = this.playerRowGraphics[player.id];
        rowGraphic.renderedDead = true;
        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;

        const texture = this.resources['skull'].texture;
        const skull = new PIXI.Sprite(texture);
        skull.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        skull.width = rowHeight;
        skull.height = rowHeight;
        skull.tint = 0x636363;
        // skull.position.set(this.padding, yOffset);

        this.removeChild(rowGraphic.titleIcon);
        this.addChild(skull);
        rowGraphic.titleIcon = skull;
        rowGraphic.titleText.style.fill = '#636363';

        const STRIKE_WIDTH = 3;
        const strikeThrough = new PIXI.Graphics();
        strikeThrough
            .beginFill(0x636363)
            .drawRect(
                rowGraphic.titleText.x, 
                rowGraphic.titleText.y + rowHeight / 2 - STRIKE_WIDTH / 2, 
                rowGraphic.titleText.width, STRIKE_WIDTH)
            .endFill();

        this.addChild(strikeThrough);
    }
}