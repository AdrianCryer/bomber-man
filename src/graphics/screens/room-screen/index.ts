import * as PIXI from "pixi.js";
import Player from "../../../model/entities/player";
import Room from "../../../model/room";
import { Resources } from "../../../util/types";
import { AbsoluteContainer } from "../../absolute-container";
import Screen from "../screen";
import RoomGrid from "./room-grid";
import StatsPane from "./stats-pane";

const HEADER_HEIGHT_PX = 120;
const MIN_PADDING_SIDES_PX = 100;
const MIN_PADDING_BOTTOM_PX = 20;

export default class RoomScreen extends Screen {

    resources: Resources;
    playerId: string;
    title: PIXI.Text;
    header: AbsoluteContainer;
    grid: RoomGrid;
    statsPane: StatsPane;

    constructor(bounds: PIXI.Rectangle, resources: Resources, initialMatch: Room, playerId: string) {
        super(bounds);
        this.resources = resources;
        this.playerId = playerId;
        this.sortableChildren = true;

        this.setupMatch(initialMatch);
        this.setupStatsPane(initialMatch);
        this.setupHeader();
        this.setupBackground();
    }

    setupHeader() {
        const gameBounds = this.grid.renderableArea.getBounds();
        const headerHeight = gameBounds.y;

        const style = new PIXI.TextStyle({
            fontFamily: "8-bit Arcade In",
            fontStyle: "normal",
            fill: '#FFFFFF',
            dropShadow: true,
            dropShadowAngle: 0.57,
            dropShadowDistance: 3,
            fontSize: 60,
            strokeThickness: 3
        });

        const scoreTitle = new PIXI.Text("SCORE 000", style);
        scoreTitle.position.set(this.bounds.width / 2, headerHeight / 2 - 20);
        scoreTitle.anchor.set(0.5);
        scoreTitle.zIndex = 10;
        this.addChild(scoreTitle);

        const timeTitle = new PIXI.Text("TIME 000", style);
        timeTitle.position.set(this.bounds.width / 2, headerHeight / 2 + 20);
        timeTitle.anchor.set(0.5);
        timeTitle.zIndex = 10;
        this.addChild(timeTitle); 
    }

    setupBackground() {
        const gameBounds = this.grid.renderableArea.getBounds();
        const frame = new PIXI.Graphics();
        frame
            .beginFill(0x004773)
            .drawRect(
                this.bounds.x,
                gameBounds.y,
                this.bounds.width,
                this.bounds.height - gameBounds.y
            )
            .endFill();
        this.addChild(frame);

        const background = new PIXI.TilingSprite(this.resources['brick'].texture);
        background.width = this.bounds.width;
        background.height = this.bounds.height - gameBounds.y;
        background.tileScale.set(10)
        background.position.set(this.bounds.x, gameBounds.y);
        background.filters =  [new PIXI.filters.AlphaFilter(0.05)];
        this.addChild(background);
    }

    setupMatch(initialRoom: Room) {
        this.grid = new RoomGrid(this.resources, {
            defaultMapSize: { width: 16, height: 10 }
        });

        this.grid.setBounds(new PIXI.Rectangle(
            MIN_PADDING_SIDES_PX,
            HEADER_HEIGHT_PX,
            this.bounds.width - 2 * MIN_PADDING_SIDES_PX,
            this.bounds.height - HEADER_HEIGHT_PX - MIN_PADDING_BOTTOM_PX,
        ));
        this.grid.mutate(initialRoom);
        this.grid.zIndex = 1;
        this.addChild(this.grid);
    }

    setupStatsPane(initialRoom: Room) {
        this.statsPane = new StatsPane(this.resources);
        const gameBounds = this.grid.renderableArea.getBounds();
        this.statsPane.setBounds(new PIXI.Rectangle(
            this.bounds.x,
            gameBounds.y,
            (this.width - gameBounds.width) / 2,
            gameBounds.height
        ));
        this.statsPane.zIndex = 15;
        this.statsPane.mutate(initialRoom.entitities[this.playerId] as Player);
        this.addChild(this.statsPane);
    }

    updateRoom(room: Room) {
        this.grid.mutate(room);
        this.statsPane.mutate(room.entitities[this.playerId] as Player);
    }
}