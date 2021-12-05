import * as PIXI from "pixi.js";
import { Position, PowerUpConfig, Resources, Size } from "../types";
import { AbsoluteContainer } from "./absolute-container";

export type PlayerRow = {
    position: number;
    playerName: string;
    colour: number;
    powerups: PowerUpConfig;
};

const PLAYER_ROW_HEIGHT_RATIO = 0.1;
const PLAYER_ROW_OFFSET = 75;

export default class StatusBoard extends AbsoluteContainer {

    anchor: Position;
    frame: PIXI.Graphics;
    resources: Resources;
    padding: number;
    playerRows: PlayerRow[];

    constructor(bounds: PIXI.Rectangle, padding: number = 20) {
        super(bounds.x, bounds.y, bounds.width, bounds.height);

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

        for (let playerRow of this.playerRows) {
            this.renderPlayerRow(playerRow);
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
        const title = new PIXI.Text("Bomberman", {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: 24,
            fill: '#262626'
        });
        this.addChild(title);

        title.x = this.getBounds().width / 2 + this.padding;
        title.y = this.padding;
        title.anchor.x = 0.5 + (this.padding / this.getBounds().width);
    } 

    renderPlayerRow(playerRow: PlayerRow) {

        const rowHeight = this.bounds.width * PLAYER_ROW_HEIGHT_RATIO;
        const yPos = rowHeight * playerRow.position + PLAYER_ROW_OFFSET;

        const icon = new PIXI.Graphics();
        icon.clear();
        icon
            .beginFill(playerRow.colour)
            .lineStyle({ width: 2, color: 0x262626 })
            .drawRoundedRect(this.padding, yPos, rowHeight, rowHeight, 5)
            .endFill();

        const playerTitle =  new PIXI.Text(playerRow.playerName, {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: `${rowHeight}px`,
            fill: '#262626'
        });
        playerTitle.x = 1.5 * this.padding + rowHeight;
        playerTitle.position.set(1.5 * this.padding + rowHeight, yPos);

        this.addChild(playerTitle);
        this.addChild(icon);
    }
}