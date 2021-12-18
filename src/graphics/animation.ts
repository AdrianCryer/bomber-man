import * as PIXI from "pixi.js";

export type AnimationOptions = {
    duration: number;
    repeat: boolean;
}

export default class Animation {

    container: PIXI.Container;
    options: AnimationOptions;
    time: number;

    constructor(container: PIXI.Container, options: AnimationOptions) {
        this.container = container;
        this.options = options;
    }

    start() {
        this.time = 0;
        // this.container.pivot.set(0.5, 0.5);
        this.container.scale.set(0.7, 0.7);
        this.container.filters = [new PIXI.filters.AlphaFilter(0)];
    }

    tick(time: number) {
        
        this.time += time;
        const durationMs = this.options.duration * 1000;
        const timeDiff = this.time % durationMs;

        const scale = 0.7 + (timeDiff / durationMs) * 0.3;
        this.container.scale.set(scale, scale);

        const opacity = Math.min(1, timeDiff / durationMs * 2);

        this.container.filters = [new PIXI.filters.AlphaFilter(opacity)];
    }
}