import * as PIXI from "pixi.js";
import { StatsConfig, Size, StatType } from "../model/types";
import { AbsoluteContainer } from "./absolute-container";
import { Resources } from "./match-grid";

export type PlayerRow = {
    position: number;
    playerName: string;
    playerStats: StatsConfig;
    colour: number;
    isAlive: boolean;
};

const PLAYER_ROW_HEIGHT_RATIO = 0.1;
const PLAYER_ROW_OFFSET = 60;

const STAT_LABELS: Record<StatType, string> = {
    speed: 'Speed',
    explosionRadius: 'Bomb Range',
    explosionDuration: 'Bomb Duration',
    bombCount: 'Bombs',
    bombTimer: 'Bomb Timer'
};

export default class StatusBoard extends AbsoluteContainer {

    frame: PIXI.Graphics;
    resources: Resources;
    padding: number;
    playerRows: PlayerRow[];

    constructor(bounds: PIXI.Rectangle, resources: Resources, padding: number = 20) {
        super();
        this.setBounds(bounds);
        this.resources = resources;
        this.padding = padding
        this.sortableChildren = true;
        this.playerRows = [];
    }

    update(playerRows: PlayerRow[], frameHeight?: number) {

        // Lets just remove all and start again
        this.removeChildren();
        this.playerRows = playerRows;

        this.renderFrame(frameHeight);
        this.renderTitle();

        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;
        const offset = Object.keys(this.playerRows[0].playerStats || {}).length * rowHeight;

        for (let [i, playerRow] of this.playerRows.entries()) {
            if (playerRow.isAlive) {
                this.renderPlayerTitle(playerRow, PLAYER_ROW_OFFSET + (offset + 2 * rowHeight) * i);
            } else {
                this.renderPlayerTitleDead(playerRow, PLAYER_ROW_OFFSET + (offset + 2 * rowHeight) * i);
            }
            this.renderPlayerPowerups(playerRow, PLAYER_ROW_OFFSET + (offset + 2 * rowHeight) * i + rowHeight);
        }
    }

    renderFrame(height?: number) {
        this.frame = new PIXI.Graphics();
        this.frame.clear();
        this.frame
            .beginFill(0xBABDBC)
            .lineStyle({ width: 1, color: 0x333 })
            .drawRect(0, 0, this.bounds.width, height || this.bounds.height)
            .endFill();
        this.addChild(this.frame);
    }

    renderTitle() {
        const title = new PIXI.Text("STATS", {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: 20,
            fill: '#262626'
        });
        this.addChild(title);

        title.x = this.getBounds().width / 2 + this.padding;
        title.y = this.padding;
        title.anchor.x = 0.5 + (this.padding / this.getBounds().width);
    } 

    renderPlayerPowerups(playerRow: PlayerRow, yOffset: number) {

        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;

        for (let [i, stat] of Object.keys(playerRow.playerStats).entries()) {
            const cell = new PIXI.Graphics();
            const yPos = yOffset + i * rowHeight;
            cell
                .beginFill(0x006ee6)
                .lineStyle({ width: 2, color: 0x262626 })
                .drawRoundedRect(this.padding, yPos, rowHeight, rowHeight, 5)
                .endFill();
            const statText = new PIXI.Text(playerRow.playerStats[stat as StatType].toString(), {
                fontFamily: "oldschool",
                fontStyle: "normal",
                fontSize: `${Math.floor(rowHeight)}px`,
                fill: '#262626'
            });
            statText.x = 1.5 * this.padding + rowHeight;
            statText.position.set(1.5 * this.padding + rowHeight, yPos);
            this.addChild(cell);
            this.addChild(statText);
        }
    }

    renderPlayerTitleDead(playerRow: PlayerRow, yOffset: number) {
        
        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;

        const texture = this.resources['skull'].texture;
        const skull = new PIXI.Sprite(texture);
        skull.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        skull.width = rowHeight;
        skull.height = rowHeight;
        skull.tint = 0x636363;
        skull.position.set(this.padding, yOffset);

        this.addChild(skull);

        const playerTitle =  new PIXI.Text(playerRow.playerName, {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: `${rowHeight}px`,
            fill: '#636363'
        });
        playerTitle.x = 1.5 * this.padding + rowHeight;
        playerTitle.position.set(1.5 * this.padding + rowHeight, yOffset);
        this.addChild(playerTitle);

        const STRIKE_WIDTH = 3;
        const strikeThrough = new PIXI.Graphics();
        strikeThrough
            .beginFill(0x636363)
            .drawRect(playerTitle.x, playerTitle.y + rowHeight / 2 - STRIKE_WIDTH / 2, playerTitle.width, STRIKE_WIDTH)
            .endFill();

        this.addChild(strikeThrough);
    }

    renderPlayerTitle(playerRow: PlayerRow, yOffset: number) {

        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;
        const icon = new PIXI.Graphics();
        icon.clear();
        icon
            .beginFill(playerRow.colour)
            .lineStyle({ width: 2, color: 0x262626 })
            .drawRoundedRect(this.padding, yOffset, rowHeight, rowHeight, 5)
            .endFill();

        const playerTitle =  new PIXI.Text(playerRow.playerName, {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: `${rowHeight}px`,
            fill: '#262626'
        });
        playerTitle.x = 1.5 * this.padding + rowHeight;
        playerTitle.position.set(1.5 * this.padding + rowHeight, yOffset);

        this.addChild(playerTitle);
        this.addChild(icon);
    }
}