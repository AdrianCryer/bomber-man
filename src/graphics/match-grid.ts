import * as PIXI from "pixi.js";
import Match, { Bomb, ExplosionCell, GridCell, PowerUp } from "../model/match";
import { Resources } from "../model/types";
import Player from "../player";
import { AbsoluteContainer } from "./absolute-container";

export type GameRenderable<T, S extends PIXI.Container> = T & { graphic?: S, addedToCanvas: boolean };

enum LAYERING {
    GROUND = -1,
    ITEM = 0,
    ACTOR = 1,
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

    constructor(match: Match, resources: Resources) {
        super();
        this.sortableChildren = true;
        this.graphics = {};
        this.resources = resources;

        this.mutate(match);
    }

    /**
     * Mutates the grid view with the new match.
     * This can be used to render the next state of the match or refresh the 
     * grid entirely.
     * 
     * @param match 
     */
    mutate(match: Match) {
        this.match = match;

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
            graphics.delete(id.toString());
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
                this.graphics[id] = graphic;
                
                this.addChild(graphic);
            }
        }

        // Handle new grid tiles


        // Handle new powerups

        // Handle new explosions

        // Remove things that are no longer in the game.
        for (let id of graphics) {
            this.removeChild(this.graphics[id]);
        }
    }

    drawPlayers() {
        for (let player of this.match.players) {
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

    drawGridTile() {

    }

    drawGridTiles() {
        const { width, height } = this.match.settings.map.props;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                // this.match.grid[j][i]
            }
        }
    }

    calculateGridCellSize() { 
        this.cellWidth = Math.min(
            this.getBounds().width / this.match.settings.map.props.width,
            this.getBounds().height / this.match.settings.map.props.height
        );
    }

    resize() {
        throw new Error("Method not implemented.");
    }

    draw() {
        
    }
}