import { Graphics, ILineStyleOptions } from "@pixi/graphics";
import { Rectangle } from "@pixi/math";
import { ITextStyle, Text } from "@pixi/text";
import { AbsoluteContainer } from "./absolute-container";

export type ButtonOptions = {
    text: string;
    textOptions: Partial<ITextStyle>;
    backgroundColour: number;
    hoverColour: number;
    borderRadius: number;
    lineStyle?: ILineStyleOptions;
    onClick: () => void;
};

export default class Button extends AbsoluteContainer {

    frame: Graphics;
    options: ButtonOptions;
    colour: number;
    text: Text;

    constructor(options: ButtonOptions) {
        let bounds = new Rectangle(0,0,0,0);
        super(bounds.x, bounds.y, bounds.width, bounds.height);
        this.options = options;
        this.frame = new Graphics();
        this.frame.buttonMode = true;
        this.frame.interactive = true;
        this.frame
        .on("mousedown", options.onClick)
        .on('mouseover', () => this.onHover())
        .on('mouseout', () => this.onHoverRelease());
        
        this.addChild(this.frame);

        this.colour = this.options.backgroundColour;
    }

    onHover() {
        this.colour = this.options.hoverColour;
        this.draw();
    }

    onHoverRelease() {
        this.colour = this.options.backgroundColour;
        this.draw();
    }

    drawText() {
        if (!this.text) {
            this.text = new Text(this.options.text, this.options.textOptions);
            this.frame.addChild(this.text);
        }
        const { x, y, width, height } = this.getBounds();
        this.text.anchor.set(0.5);
        this.text.position.set(x + width / 2, y + height / 2);
    }

    draw() {
        const { lineStyle } = this.options;

        this.frame.clear();
        this.frame.beginFill(this.colour);
        if (this.options.lineStyle) {
            this.frame.lineStyle(lineStyle)
        }
        this.drawText();
        this.frame.drawRoundedRect(
            this.getBounds().x, 
            this.getBounds().y,
            this.getBounds().width,
            this.getBounds().height,
            10
        );
        this.frame.endFill();
    }
}   