import * as PIXI from 'pixi.js';
import { Graphics } from '@pixi/graphics';
import { Rectangle } from 'pixi.js';
import { AbsoluteContainer } from "./absolute-container";
import Button from './button';
import { Size } from '../model/types';

export type ModalOptions = {
    padding?: number;
    title: string;
    icon?: PIXI.Container;
    showCancelButton: boolean;
    focusConfirm?: boolean;
    confirmButtonText: string;
    cancelButtonText?: string;
    darkenBackground: boolean;
    // modalWidthRatio: number;
    // modalHeightRatio: number;
    modalSizeRatio: Size;
    buttonSizeRatio: Size;
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
        super();
        this.setBounds(rectangle)
        this.options = options;
        this.sortableChildren = true;

        this.window = new Graphics();
        this.addChild(this.window);

        if (this.options.icon) {
            this.icon = this.options.icon;
            this.addChild(this.icon);
        }

        this.confirmButton = new Button({
            text: options.confirmButtonText,
            textOptions: {
                fontFamily: "arial",
                fontSize: "20px",
                fill: "#ffffff"
            },
            backgroundColour: 0x006ee6,
            hoverColour: 0x4787cc,
            // lineStyle: { width: 1, color: 0x262626 },
            borderRadius: 5,
            onClick: options.onConfirm
        });
        this.window.addChild(this.confirmButton);

        if (options.showCancelButton) {
            this.cancelButton = new Button({
                text: options.cancelButtonText,
                textOptions: {
                    fontFamily: "arial",
                    fontSize: "20px",
                    fill: "#ffffff"
                },
                backgroundColour: 0x006ee6,
                hoverColour: 0x4787cc,
                borderRadius: 5,
                onClick: options.onCancel
            });
            this.window.addChild(this.cancelButton);
        }
    }

    show() {
        this.visible = false;
    }

    hide() {
        this.visible = true;
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

    drawButtons() {
        const width = this.getBounds().width * this.options.modalSizeRatio.width;
        const height = this.getBounds().height * this.options.modalSizeRatio.height;
        const BUTTON_WIDTH = this.options.buttonSizeRatio.width;
        const BUTTON_HEIGHT = this.options.buttonSizeRatio.height;

        const buttonAnchor = new Rectangle(
            width * (0.5 - BUTTON_WIDTH / 2),
            height - this.options.padding - BUTTON_HEIGHT * height,
            width * BUTTON_WIDTH,
            height * BUTTON_HEIGHT,
        );

        if (this.options.showCancelButton) {
            this.confirmButton.setBounds(new Rectangle(
                buttonAnchor.x + this.options.padding / 2 + width * BUTTON_WIDTH / 2,
                buttonAnchor.y,
                buttonAnchor.width,
                buttonAnchor.height
            ));
            this.cancelButton.setBounds(new Rectangle(
                buttonAnchor.x - this.options.padding / 2 - width * BUTTON_WIDTH / 2,
                buttonAnchor.y,
                buttonAnchor.width,
                buttonAnchor.height
            ));
            this.cancelButton.draw();
        } else {
            this.confirmButton.setBounds(buttonAnchor);
        }

        this.confirmButton.draw();
    }

    draw() {

        const width = this.getBounds().width * this.options.modalSizeRatio.width;
        const height = this.getBounds().height * this.options.modalSizeRatio.height;

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
        
        // Title
        this.title = new PIXI.Text(this.options.title, {
            fontFamily: "oldschool",
            fontSize: 48,
            fill: '#262626'
        });
        this.window.addChild(this.title);
        this.title.position.set(
            width / 2,
            this.options.padding
        )
        this.title.anchor.set(0.5, 0);

        // Icon
        if (this.options.icon) {
            this.icon.position.set(
                this.getBounds().width / 2,
                this.getBounds().height / 2,
            );
        }

        this.drawButtons();
    }
}