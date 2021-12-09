import * as PIXI from "pixi.js";
import Game from "../game";
import Player from "../player";
import { Direction } from "../types";

export interface PlayerController {
    setup: (view: Game, thisPlayer: Player) => void;
};

const keyMap : { [key: string]: Direction } = {
    'ArrowRight': Direction.RIGHT,
    'ArrowLeft': Direction.LEFT,
    'ArrowUp': Direction.UP,
    'ArrowDown': Direction.DOWN,
};

export class UserInputController implements PlayerController {
    
    setup(game: Game, thisPlayer: Player) {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') {
                thisPlayer.setMoving(Direction.RIGHT);
            } else if (e.key === 'ArrowLeft') {
                thisPlayer.setMoving(Direction.LEFT);
            } else if (e.key === 'ArrowUp') {
                thisPlayer.setMoving(Direction.UP);
            } else if (e.key === 'ArrowDown') {
                thisPlayer.setMoving(Direction.DOWN);
            } else if (e.code === 'Space') {
                // thisPlayer.placeBomb();
            }
        });

        document.addEventListener("keyup", e => {
            if (thisPlayer.wantsToMove && thisPlayer.movingDirection === keyMap[e.key]) {
                thisPlayer.wantsToMove = false;
            }
        });
    }

}

export class RandomAIInputController implements PlayerController {

    private strollDelay: number = 200;
    private lastMove: number = 0;

    setup(view: Game, thisPlayer: Player) {
        view.ticker.add(() => {
            if (view.time >= this.lastMove + this.strollDelay) {
                this.lastMove = view.time;  
                let index = Math.floor(Math.random() * Object.values(keyMap).length);
                let nextDirection = Object.values(keyMap)[index];
                
                thisPlayer.setMoving(nextDirection);
            }
        });
    }

    // Todo
    private findNearestBrick() {}

    // Go for powerup
    

    // Run away
    private runAway() {}


}