import * as PIXI from "pixi.js";
import Player from "../../../model/entities/player";
import Match from "../../../model/room";
import { AbsoluteContainer } from "../../absolute-container";
import RoomGrid from "./room-grid";
import StatsPane from "./stats-pane";

const HEADER_HEIGHT_PX = 120;
const MIN_PADDING_SIDES_PX = 100;
const MIN_PADDING_BOTTOM_PX = 20;

export default class RoomScreen extends AbsoluteContainer {

    app: PIXI.Application;
    playerId: string;
    title: PIXI.Text;
    header: AbsoluteContainer;
    grid: RoomGrid;
    statsPane: StatsPane;

    constructor(app: PIXI.Application, initialMatch: Match, playerId: string) {
        super();
        this.app = app;
        this.setBounds(new PIXI.Rectangle(
            0, 
            0, 
            this.app.view.width, 
            this.app.view.height 
        ));
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

        const background = new PIXI.TilingSprite(this.app.loader.resources['brick'].texture);
        background.width = this.bounds.width;
        background.height = this.bounds.height - gameBounds.y;
        background.tileScale.set(10)
        background.position.set(this.bounds.x, gameBounds.y);
        background.filters =  [new PIXI.filters.AlphaFilter(0.05)];
        this.addChild(background);
    }

    setupMatch(initialMatch: Match) {
        this.grid = new RoomGrid(this.app.loader.resources, {
            defaultMapSize: { width: 16, height: 10 }
        });

        this.grid.setBounds(new PIXI.Rectangle(
            MIN_PADDING_SIDES_PX,
            HEADER_HEIGHT_PX,
            this.bounds.width - 2 * MIN_PADDING_SIDES_PX,
            this.bounds.height - HEADER_HEIGHT_PX - MIN_PADDING_BOTTOM_PX,
        ));
        this.grid.mutate(initialMatch);
        this.grid.zIndex = 1;
        this.addChild(this.grid);
    }

    setupStatsPane(initialMatch: Match) {
        this.statsPane = new StatsPane(this.app.loader.resources);
        const gameBounds = this.grid.renderableArea.getBounds();
        this.statsPane.setBounds(new PIXI.Rectangle(
            this.bounds.x,
            gameBounds.y,
            (this.width - gameBounds.width) / 2,
            gameBounds.height
        ));
        this.statsPane.zIndex = 15;
        this.statsPane.mutate(initialMatch.entitities[this.playerId] as Player);
        this.addChild(this.statsPane);
    }

    updateMatch(match: Match) {
        this.grid.mutate(match);
        this.statsPane.mutate(match.entitities[this.playerId] as Player);
    }
}