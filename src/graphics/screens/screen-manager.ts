import * as PIXI from "pixi.js";
import { AbsoluteContainer } from "../absolute-container";

export type TransitionConfig = {
    transitionName: 'radial-in' | 'radial-out';
};

export default class ScreenManager {

    app: PIXI.Application;
    history: [routeName: string, screen: AbsoluteContainer][];

    constructor(app: PIXI.Application) {
        this.app = app;
        this.history = [];
    }

    navigate(routeName: string, screen: AbsoluteContainer, transitionConfig?: TransitionConfig) {
        if (this.history.length > 0) {
            const lastScreen = this.history[this.history.length - 1][1];
            if (transitionConfig) {
                const name = transitionConfig.transitionName;
                if (name === 'radial-in') {
                    this.playRadialScreenTransition(lastScreen, false, 7, () => {
                        this.navigate(routeName, screen);
                    });
                } else if (name === 'radial-out') {
                    this.app.stage.addChild(screen);
                    screen.show();
                    
                    this.playRadialScreenTransition(screen, true, 7, () => {
                        lastScreen.hide();
                        this.history.push([routeName, screen]);
                    });
                }
            } else {
                lastScreen.hide();
            }
        }

        if (this.history.length == 0 || !transitionConfig) {
            this.app.stage.addChild(screen);
            this.history.push([routeName, screen]);
            screen.show();
        }
    }

    getScreen(routeName: string): AbsoluteContainer {
        for (let [name, screen] of this.history) {
            if (name === routeName) {
                return screen;
            }   
        }
        return null;
    }

    goBack(transitionConfig?: TransitionConfig) {
        const last = this.history.pop();
    }

    playRadialScreenTransition(target: PIXI.Container, reverse: boolean, speed: number, callback: () => void) {
        const { width, height } = this.app.screen;
        const stage = this.app.stage;

        const hole = new PIXI.Graphics();
        stage.addChild(hole);
        target.mask = hole;

        const maxRadius = Math.max(width / 2, height / 2) + 50;
        let radius = reverse ? 0 : maxRadius;

        animate();

        function animate() {
            if ((!reverse && radius <= 0) || (reverse && radius >= maxRadius)) {
                hole.clear();
                callback();
                if (reverse) {
                    target.mask = null;
                }
                stage.removeChild(hole);
                return;
            }
            hole
                .clear()
                .beginFill()
                .drawCircle(width / 2, height / 2, radius)
                .endFill();

            radius += (reverse ? speed : -speed);
            requestAnimationFrame(animate);
        }
    }
}