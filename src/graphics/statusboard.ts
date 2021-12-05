import * as PIXI from "pixi.js";
import { Position, Resources, Size } from "../types";
import { AbsoluteContainer } from "./absolute-container";


export default class StatusBoard extends AbsoluteContainer {

    anchor: Position;
    frame: PIXI.Graphics;
    resources: Resources;

    constructor(bounds: PIXI.Rectangle) {
        super(bounds.x, bounds.y, bounds.width, bounds.height);
        this.sortableChildren = true;
        this.frame = new PIXI.Graphics();
        this.addChild(this.frame);
    }

    update() {
        this.renderFrame();
    }

    renderFrame(height?: number) {

        this.frame.clear();
        this.frame
            .beginFill(0xEA4C46)
            .drawRect(0, 0, this.bounds.width, height || this.bounds.height)
            .endFill();
    }

    renderPlayerRow() {

        // PIXI.BitmapFont.from("TitleFont", {
        //     fill: "#333333",
        //     fontSize: 40,
        //     fontWeight: 'bold',
        // });
        // const text = new PIXI.BitmapText("Hello World", {
        //     fontName: "Desyrel",
        //     fontSize: 32
        // });
        
    } 
}