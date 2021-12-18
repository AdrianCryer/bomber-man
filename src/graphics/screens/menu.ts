import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { AbsoluteContainer } from "../absolute-container";

const BACKGROUND_COLOUR = 0x00253C;
const BORDER_PADDING = 0.08;

export type MenuOptions = {
    options: {
        text: string;
        onSelect: () => void;
    }[]
};

export default class MenuScreen extends AbsoluteContainer {

    app: PIXI.Application;
    title: PIXI.Text;
    options: MenuOptions;

    constructor(app: PIXI.Application) {
        super();
        this.app = app;
        this.app.renderer.backgroundColor = BACKGROUND_COLOUR;
        this.setBounds(new Rectangle(
            0, 
            0, 
            this.app.view.width, 
            this.app.view.height 
        ));

        const margin = BORDER_PADDING * this.bounds.width;
        const frame = new PIXI.Graphics();
        frame
            .beginFill(0x004773)
            .drawRoundedRect(
                this.bounds.x + margin,
                this.bounds.y + margin,
                this.bounds.width - margin * 2,
                this.bounds.height - margin * 2,
                this.bounds.width / 8
            )
            .endFill();
        const texture = this.app.renderer.generateTexture(frame);
        const frameSprite = new PIXI.Sprite(texture);
        frameSprite.position.set(margin, margin);
        this.addChild(frameSprite);

        const style = new PIXI.TextStyle({
            fontFamily: "oldschool",
            fontStyle: "normal",
            fill: '#FFFFFF',
            dropShadow: true,
            dropShadowAngle: 0.57,
            dropShadowDistance: 3,
            fontSize: 80,
            strokeThickness: 3
        });
        this.title = new PIXI.Text("BOMBERMAN", style);
        this.title.position.set(this.bounds.width / 2, margin);
        this.title.anchor.set(0.5, 0.5);
        this.addChild(this.title);

        const style2 = new PIXI.TextStyle({
            fontFamily: "8-bit Arcade In",
            fontStyle: "normal",
            fill: '#FFFFFF',
            dropShadow: true,
            dropShadowAngle: 0.57,
            dropShadowDistance: 3,
            fontSize: 80,
            strokeThickness: 3
        });
        const subTitle = new PIXI.Text("RETURNS", style2);
        subTitle.position.set(this.bounds.width / 2, margin + this.title.height / 2 + 20);
        subTitle.anchor.set(0.5, 0.5);
        this.addChild(subTitle);
    }

    setupMenu() {
        // for (let )
    }
}