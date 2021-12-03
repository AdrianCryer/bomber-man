import * as PIXI from "pixi.js";
import { Position, Resources, Size } from "./types";



export default class StatusBoard {

    container: PIXI.Container;
    anchor: Position;
    frame: PIXI.Graphics;
    resources: Resources;

    constructor(container: PIXI.Container, resources: Resources) {

        this.container = container;
        this.container.sortableChildren = true;

        this.frame = new PIXI.Graphics();
        // this.container.addChild(this.frame);
        // const test = new PIXI.Graphics();
        // test.beginFill(0x65).drawRoundedRect(0, 0, 0.5, 0.5, 10).endFill();

        // this.frame.addChild(test);

        const text = new PIXI.Text("Test", {
            fill: "#000",
            fontSize: 0.45,
            fontWeight: 'bold',
            fontFamily: 'arial'
        });
        // text.scale.set(1,1)
        // this.container.scale.set(1, 1)
        this.container.addChild(text);
        console.log(this.container)
    }

    update() {

    }

    renderFrame(height?: number) {

        this.frame.clear();
        this.frame
            .beginFill(0xEA4C46)
            .drawRect(0, 0, 1, 1)
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

    render() {
        this.renderFrame();
        this.renderPlayerRow();
    }
}