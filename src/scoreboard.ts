import { Graphics } from "pixi.js";
import { Position, Size } from "./types";



export default class Scoreboard {

    dimensions: Size;
    anchor: Position;
    graphic: Graphics;

    constructor() {
        this.graphic = new Graphics();
    }

    update() {

    }

    render() {
        this.graphic.clear();
        this.graphic
            .beginFill(0xEA4C46)
            .drawRect(
                this.anchor.x, 
                this.anchor.y, 
                this.dimensions.width,
                this.dimensions.height
            )
            .endFill();
    }
}