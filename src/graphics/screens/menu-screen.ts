import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { Ease, ease } from "pixi-ease";
import { AbsoluteContainer } from "../absolute-container";

const BACKGROUND_COLOUR = 0x00253C;
const BORDER_PADDING = 1300 * 0.06;

export type MenuOptions = {
    title: string;
    menu: {
        text: string;
        onSelect: () => void;
    }[]
};

export default class MenuScreen extends AbsoluteContainer {

    app: PIXI.Application;
    title: PIXI.Text;
    options: MenuOptions;

    constructor(app: PIXI.Application, options: MenuOptions) {

        super();
        this.app = app;
        this.options = options;
        this.app.renderer.backgroundColor = BACKGROUND_COLOUR;
        this.setBounds(new Rectangle(
            0, 
            0, 
            this.app.view.width, 
            this.app.view.height 
        ));
        
        this.setupBackground();
        this.setupTitle();
        this.setupMenu();
    }

    setupBackground() {
        const frame = new PIXI.Graphics();
        frame
            .beginFill(0x004773)
            .drawRect(
                this.bounds.x + BORDER_PADDING,
                this.bounds.y + BORDER_PADDING,
                this.bounds.width - BORDER_PADDING * 2,
                this.bounds.height - BORDER_PADDING * 2
            )
            .endFill();

        const frameBackground = new PIXI.TilingSprite(this.app.loader.resources['brick'].texture);
        frameBackground.width = this.bounds.width - BORDER_PADDING * 2;
        frameBackground.height = this.bounds.height - BORDER_PADDING * 2;
        frameBackground.tileScale.set(20)
        frameBackground.position.set(BORDER_PADDING);
        frameBackground.filters =  [new PIXI.filters.AlphaFilter(0.1)]
        
        this.addChild(frame);
        this.addChild(frameBackground);
    }

    setupTitle() {
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
        this.title.position.set(this.bounds.width / 2, BORDER_PADDING);
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
        subTitle.position.set(this.bounds.width / 2, BORDER_PADDING + this.title.height / 2 + 20);
        subTitle.anchor.set(0.5, 0.5);
        this.addChild(subTitle);

        ease.add(this.title, { scaleX: 1.05 }, { repeat: true, reverse: true });
        ease.add(subTitle, { scaleX: 1.05 }, { repeat: true, reverse: true });
    }

    setupMenu() {
        const style = new PIXI.TextStyle({
            fontFamily: "8-bit Arcade In",
            fontStyle: "normal",
            fill: '#FFFFFF',
            dropShadow: true,
            dropShadowAngle: 0.57,
            dropShadowDistance: 3,
            fontSize: 80,
            strokeThickness: 3
        });

        const textHeight = this.options.menu.length * 110;
        let optionsWidth = 0;
        let items = [];

        for (let [i, option] of this.options.menu.entries()) {
            const text = option.text;

            const menuItem = new PIXI.Text("[ _ ] " + text, style.clone());
            optionsWidth = Math.max(optionsWidth, menuItem.width);
            menuItem.position.set(this.bounds.width / 2, this.bounds.height / 2 - textHeight / 2 + i * 110);
            menuItem.interactive = true;
            menuItem.on('mouseover', () => {
                menuItem.text = "[ x ] " + text;
                menuItem.style.fontStyle = 'oblique'
            });
            menuItem.on('mouseout', () => {
                menuItem.style.fill = "white" 
                menuItem.text = "[ _ ] " + text
                menuItem.style.fontStyle = 'normal'
            });
            menuItem.on("mousedown", option.onSelect);
            this.addChild(menuItem);
            items.push(menuItem);
        }

        for (let item of items) {
            item.x -= optionsWidth / 2;
        }
    }
}