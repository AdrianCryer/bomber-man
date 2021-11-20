import Game from "./game";
import Player, { Direction } from "./player";

export interface PlayerController {
    setup: (view: Game, thisPlayer: Player) => void;
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
                thisPlayer.placeBomb();
            }
        });

        const keyMap : { [key: string]: Direction } = {
            'ArrowRight': Direction.RIGHT,
            'ArrowLeft': Direction.LEFT,
            'ArrowUp': Direction.UP,
            'ArrowDown': Direction.DOWN,
        };

        document.addEventListener("keyup", e => {
            if (thisPlayer.wantsToMove && thisPlayer.movingDirection === keyMap[e.key]) {
                thisPlayer.wantsToMove = false;
            }
        });
    }

}

// class RandomAIInputController implements PlayerController {

// }

