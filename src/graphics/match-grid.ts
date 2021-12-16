import * as PIXI from "pixi.js";
import Bot from "../model/entities/bot";
import Entity from "../model/entities/entity";
import { CellType } from "../model/game-map";
import Match from "../model/match";
import Player from "../model/entities/player";
import { AbsoluteContainer } from "./absolute-container";
import Bomb from "../model/entities/bomb";
import Explosion from "../model/entities/explosion";

export type GameRenderable<T, S extends PIXI.Container> = T & { graphic?: S, addedToCanvas: boolean };
export type Resources = PIXI.utils.Dict<PIXI.LoaderResource>;

enum LAYERING {
    GROUND = 0,
    ITEM = 1,
    ACTOR = 2,
    TOP = 10
};

export type MatchGridSettings = {
    backgroundColour: number;
};

export default class MatchGrid extends AbsoluteContainer {

    explosions: PIXI.Sprite[];
    bombs: PIXI.Sprite[];
    powerup: PIXI.Graphics[];
    players: PIXI.Graphics[];
    grid: PIXI.Sprite[][];

    graphics: Record<string, PIXI.Container>; 
    renderableArea: AbsoluteContainer;
    
    cellWidth: number;
    match: Match;
    resources: Resources;

    constructor(resources: Resources) {
        super();
        this.graphics = {};
        this.resources = resources;
        this.renderableArea = new AbsoluteContainer();
        this.renderableArea.sortableChildren = true;
        this.addChild(this.renderableArea);
    }

    setBounds(bounds: PIXI.Rectangle) {
        super.setBounds(bounds);
    }

    calculateGridCellSize(match: Match) { 
        this.cellWidth = Math.min(
            this.getBounds().width /  match.settings.map.props.width,
            this.getBounds().height / match.settings.map.props.height
        );
    }

    getRenderableGridBounds(match: Match): PIXI.Rectangle {
        // if (!this.match) return PIXI.Rectangle.EMPTY;
        this.calculateGridCellSize(match);
        const { x, y, width, height } = this.getBounds();
        const boundsWidth = this.cellWidth * match.settings.map.props.width;
        const boundsHeight = this.cellWidth * match.settings.map.props.height;

        return new PIXI.Rectangle(
            x + width / 2 - boundsWidth / 2,
            y + height / 2 - boundsHeight / 2,
            boundsWidth,
            boundsHeight
        );
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
        const renderableArea = this.getRenderableGridBounds(match);
        this.renderableArea.position.set(renderableArea.x, renderableArea.y);

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
                    this.renderableArea.addChild(graphic);
                }
                graphics.delete(id);
            }
        }

        // Handle new powerups
        for (let powerup of match.powerups) {
            const id = powerup.id;
            let graphic = (this.graphics[id] || new PIXI.Graphics()) as PIXI.Graphics;
            if (!(id in this.graphics)) {
                graphic = new PIXI.Graphics();
                graphic.zIndex = LAYERING.ITEM;

                this.graphics[id] = graphic;
                this.renderableArea.addChild(graphic);
            }
            graphic.clear();
            graphic
                .beginFill(0x006ee6)
                .lineStyle({ width: 1, color: 0x26 })
                .drawRoundedRect(
                    (0.25 + powerup.position.x) * this.cellWidth, 
                    (0.25 + powerup.position.y) * this.cellWidth, 
                    this.cellWidth / 2,
                    this.cellWidth / 2,
                    5
                )
                .endFill();
            graphics.delete(id);
        }

        for (let entity of Object.values(match.entitities)) {
            if (entity instanceof Player) {
                this.drawActor(entity, graphics);
            } else if (entity instanceof Bomb) {
                this.drawBomb(entity, graphics);
            } else if (entity instanceof Explosion) {
                this.drawExplosion(entity, graphics);
            }
        }

        // Remove things that are no longer in the game.
        for (let id of graphics) {
            this.renderableArea.removeChild(this.graphics[id]);
        }

    }

    drawExplosion(explosion: Explosion, check: Set<string>) {
        for (let cell of explosion.cells) {

            const id = cell.id;
            let graphic = (this.graphics[id] || null) as PIXI.Sprite;
            if (!(id in this.graphics)) {
                const sheet = this.resources['explosion'].spritesheet;
                let code = 'base';
                if (cell.isCentre) {
                    code = 'centre';
                } else if (cell.isEnd) {
                    code = 'end';
                }

                const texture = sheet.textures[`explosion-${code}-${cell.intensity}`];
                graphic = new PIXI.Sprite(texture);
                graphic.zIndex = LAYERING.TOP;
                            
                const angle = (cell.direction + 1) * 90 % 360;
                graphic.angle = angle;
                
                this.graphics[id] = graphic;
                this.renderableArea.addChild(graphic);
            }

            const x = (0.5 + cell.position.x) * this.cellWidth;
            const y = (0.5 + cell.position.y) * this.cellWidth;
            graphic.position.set(x, y);

            const texture = graphic.texture;
            graphic.pivot.set(texture.width / 2, texture.height / 2);

            graphic.scale.set(this.cellWidth / texture.width, this.cellWidth / texture.height)
            check.delete(id);
        }
    }

    drawBomb(bomb: Bomb, check: Set<string>) {
        const id = bomb.id;
        let graphic;
        if (!(id in this.graphics)) {
            const sheet = this.resources['bomb'].spritesheet;
            graphic = new PIXI.AnimatedSprite(sheet.animations['exploding']);

            graphic.animationSpeed = 0.3; 
            graphic.play();
            graphic.zIndex = LAYERING.ITEM;
            this.graphics[id] = graphic;
            this.renderableArea.addChild(graphic);
        } else {
            graphic = this.graphics[id];
        }
        graphic.width = this.cellWidth;
        graphic.height = this.cellWidth;
        graphic.position.x = bomb.position.x * this.cellWidth;
        graphic.position.y = bomb.position.y * this.cellWidth;

        check.delete(id);
    }

    drawActor(actor: Player, check: Set<string>) {
        // if (actor instanceof Bot) {
        //     console.log(actor);
        // }
        const id = actor.id;
        if (!(id in this.graphics)) {
            const graphic = new PIXI.Graphics();
            graphic.zIndex = LAYERING.ACTOR;

            this.graphics[id] = graphic;
            this.renderableArea.addChild(graphic);
        }
        check.delete(id);

        const graphic = this.graphics[actor.id] as PIXI.Graphics;
        if (!actor.isAlive) {
            graphic.clear();
            return;
        }
        if (actor.isAlive) {
            graphic.clear();
            graphic
                .beginFill(0xEA4C46)
                .drawRect(
                    (0.25 + actor.position.x) * this.cellWidth, 
                    (0.25 + actor.position.y) * this.cellWidth, 
                    this.cellWidth / 2,
                    this.cellWidth / 2
                )
                .endFill();
        }
    }
}