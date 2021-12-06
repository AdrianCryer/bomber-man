import * as PIXI from 'pixi.js';
import { Graphics } from '@pixi/graphics';
import { Rectangle } from 'pixi.js';
import { AbsoluteContainer } from "./absolute-container";
import Button from './button';

export type ModalOptions = {
    padding?: number;
    title: string;
    icon?: PIXI.Container;
    showCancelButton: boolean;
    focusConfirm?: boolean;
    confirmButtonText: string;
    cancelButtonText?: string;
    darkenBackground: boolean;
    modalWidthRatio: number;
    modalHeightRatio: number;
    onConfirm: () => void;
    onCancel?: () => void; 
};

export default class Modal extends AbsoluteContainer {

    options: ModalOptions;
    hidden: boolean;
    window: Graphics;
    background: Graphics;
    title: PIXI.Text;
    modalBounds: Rectangle;
    icon: PIXI.Container;
    confirmButton: Button;
    cancelButton?: Button;

    constructor(rectangle: PIXI.Rectangle, options: ModalOptions) {
        super(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.options = options;
        this.sortableChildren = true;

        this.window = new Graphics();
        this.addChild(this.window);

        this.icon = this.options.icon;
        this.addChild(this.icon);

        this.confirmButton = new Button({
            text: options.confirmButtonText,
            textOptions: {
                fontFamily: "oldschool",
                fontSize: "20px",
                fill: "#ffffff"
            },
            backgroundColour: 0x006ee6,
            hoverColour: 0x4787cc,
            // lineStyle: { width: 1, color: 0x262626 },
            borderRadius: 5,
            onClick: options.onConfirm
        });
        this.addChild(this.confirmButton);

        if (options.showCancelButton) {
            this.cancelButton = new Button({
                text: options.cancelButtonText,
                textOptions: {
                    fontFamily: "oldschool",
                    fontSize: "20px"
                },
                backgroundColour: 0x262626,
                hoverColour: 0x444444,
                borderRadius: 10,
                onClick: options.onCancel
            });
            this.addChild(this.cancelButton);
        }
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

    drawConfirmButton() {
        const width = this.getBounds().width * this.options.modalWidthRatio;
        const height = this.getBounds().height * this.options.modalWidthRatio;

        this.confirmButton.setBounds(new Rectangle(
            this.modalBounds.x + width / 2 - width * 0.1,
            this.modalBounds.y + height - this.options.padding - height * 0.1,
            width * 0.2,
            height * 0.1
        ));

        this.confirmButton.draw();
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
        
        // Title
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

        // Icon
        this.icon.position.set(
            this.getBounds().width / 2,
            this.getBounds().height / 2,
        );

        this.drawConfirmButton();
    }
}