import * as PIXI from "pixi.js";
import { CellType } from "../model/game-map";
import Match, { Bomb, ExplosionCell, GridCell, PowerUp } from "../model/match";
import { Resources } from "../model/types";
import Player from "../player";
import { AbsoluteContainer } from "./absolute-container";

export type GameRenderable<T, S extends PIXI.Container> = T & { graphic?: S, addedToCanvas: boolean };

enum LAYERING {
    GROUND = 0,
    ITEM = 1,
    ACTOR = 2,
    TOP = 10
};

export default class MatchGrid extends AbsoluteContainer {

    explosions: PIXI.Sprite[];
    bombs: PIXI.Sprite[];
    powerup: PIXI.Graphics[];
    players: PIXI.Graphics[];
    grid: PIXI.Sprite[][];

    graphics: Record<string, PIXI.Container>; 
    
    cellWidth: number;
    match: Match;
    resources: Resources;

    constructor(resources: Resources) {
        super();
        this.sortableChildren = true;
        this.graphics = {};
        this.resources = resources;
    }

    setBounds(bounds: PIXI.Rectangle) {
        super.setBounds(bounds);
    }

    /**
     * Mutates the grid view with the new match.
     * This can be used to render the next state of the match or refresh the 
     * grid entirely.
     * 
     * @param match 
     */
    mutate(match: Match) {
        this.calculateGridCellSize(match);

        // Setup grid
        const { height, width } = match.settings.map.props;
        if (!this.grid || height !== this.grid.length || width !== this.grid[0].length) {
            this.grid = [];
            for (let i = 0; i < height; i++) {
                this.grid[i] = new Array(width);
            }
        }
        
        // Removed
        const graphics = new Set(Object.keys(this.graphics));

        // Handle new players
        for (let player of match.players) {
            const id = player.id;
            if (!(id in this.graphics)) {
                const graphic = new PIXI.Graphics();
                graphic.zIndex = LAYERING.ACTOR;

                this.graphics[id] = graphic;
                this.addChild(graphic);
            }
            graphics.delete(id);
        }

        // Handle new bombs
        for (let bomb of match.bombs) {

            const id = bomb.id;
            if (!(id in this.graphics)) {
                const sheet = this.resources['bomb'].spritesheet;
                const graphic = new PIXI.AnimatedSprite(sheet.animations['exploding']);

                graphic.animationSpeed = 0.3; 
                graphic.play();
                graphic.zIndex = LAYERING.ITEM;
                graphic.width = this.cellWidth;
                graphic.height = this.cellWidth;
                graphic.position.x = bomb.position.x * this.cellWidth;
                graphic.position.y = bomb.position.y * this.cellWidth;

                this.graphics[id] = graphic;
                this.addChild(graphic);
            }
            graphics.delete(id);
        }

        // Handle new grid tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const id = match.grid[y][x].id;
                if (!this.grid[y][x] || !(id in this.graphics)) {

                    let spriteName;
                    switch (match.grid[y][x].type) {
                        case CellType.OPEN:
                        case CellType.SPAWN:
                            spriteName = 'open';
                            break;
                        case CellType.BRICK:
                            spriteName = 'brick';
                            break;
                        case CellType.SOLID:
                            spriteName = 'solid';
                            break;
                    }

                    const texture = this.resources[spriteName].texture;
                    const graphic = new PIXI.Sprite(texture);
                    graphic.position.x = x * this.cellWidth;
                    graphic.position.y = y * this.cellWidth;
                    graphic.width = this.cellWidth;
                    graphic.height = this.cellWidth;
                    graphic.zIndex = LAYERING.GROUND;

                    this.graphics[id] = graphic;
                    this.grid[y][x] = graphic;
                    this.addChild(graphic);
                }
                graphics.delete(id);
            }
        }

        // Handle new powerups

        // Handle new explosions

        // Remove things that are no longer in the game.
        for (let id of graphics) {
            this.removeChild(this.graphics[id]);
        }

        this.drawPlayers(match);
    }

    drawPlayers(match: Match) {
        for (let player of match.players) {
            const graphic = this.graphics[player.id] as PIXI.Graphics;
            if (!player.isAlive) {
                graphic.clear();
                return;
            }
            if (player.isAlive) {
                graphic.clear();
                graphic
                    .beginFill(0xEA4C46)
                    .drawRect(
                        (0.25 + player.position.x) * this.cellWidth, 
                        (0.25 + player.position.y) * this.cellWidth, 
                        this.cellWidth / 2,
                        this.cellWidth / 2
                    )
                    .endFill();
            }
        }
    }

    drawBombs() {
        
    }

    calculateGridCellSize(match: Match) { 
        this.cellWidth = Math.min(
            this.getBounds().width /  match.settings.map.props.width,
            this.getBounds().height / match.settings.map.props.height
        );
    }

    resize() {
        throw new Error("Method not implemented.");
    }

    draw() {
        
    }
}