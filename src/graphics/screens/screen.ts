import { Rectangle } from "pixi.js";
import { AbsoluteContainer } from "../absolute-container";

export default class Screen extends AbsoluteContainer {

    constructor(bounds: Rectangle) {
        super();
        this.setBounds(bounds);
    }
}