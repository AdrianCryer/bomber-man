import * as PIXI from 'pixi.js';
import { Graphics } from '@pixi/graphics';
import { Rectangle } from 'pixi.js';
import { AbsoluteContainer } from "./absolute-container";

export type ModalOptions = {
    padding?: number;
    title: string;
    icon?: PIXI.Container;
    showCloseButton: boolean;
    showCancelButton: boolean;
    focusConfirm?: boolean;
    confirmButtonText: string;
    cancelButtonText?: string;
    darkenBackground: boolean;
    modalWidthRatio: number;
    modalHeightRatio: number;
};

export default class Modal extends AbsoluteContainer {

    options: ModalOptions;
    hidden: boolean;
    window: Graphics;
    background: Graphics;
    title: PIXI.Text;
    modalBounds: Rectangle;

    constructor(rectangle: PIXI.Rectangle, options: ModalOptions) {
        super(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.options = options;

        this.window = new Graphics();
        this.addChild(this.window);
    }

    show() {
        this.hidden = false;
    }

    hide() {
        this.hidden = true;
    }

    drawTitle() {
        const title = new PIXI.Text("STATS", {
            fontFamily: "oldschool",
            fontStyle: "normal",
            fontSize: 20,
            fill: '#262626'
        });
        this.addChild(title);

    }

    draw() {
        if (this.hidden) {
            return;
        }
        
        const width = this.getBounds().width * this.options.modalWidthRatio;
        const height = this.getBounds().height * this.options.modalWidthRatio;

        this.window
            .clear()
            .beginFill(0xffffff)
            .lineStyle({ width: 3, color: 0x262626 })
            .drawRoundedRect(0, 0, width, height, 10)
            .endFill();

        this.modalBounds = new Rectangle(
            (this.getBounds().width - width) / 2,
            (this.getBounds().height - height) / 2,
            width,
            height
        );
        this.window.position.set(this.modalBounds.x, this.modalBounds.y);

        this.title = new PIXI.Text(this.options.title, {
            fontFamily: "oldschool",
            fontSize: 48,
            fill: '#262626'
        });
        this.addChild(this.title);
        this.title.position.set(
            this.modalBounds.x + width / 2,
            this.modalBounds.y + this.options.padding
        )
        this.title.anchor.set(0.5, 0);
    }
}