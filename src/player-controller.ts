import Game from "./game";
import Player from "./player";

export interface PlayerController {
    setup: (view: Game, thisPlayer: Player) => void;
};

export class UserInputController implements PlayerController {

    setup(game: Game, thisPlayer: Player) {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') {
                thisPlayer.setMovingX(1);
            } else if (e.key === 'ArrowLeft') {
                thisPlayer.setMovingX(-1);
            } else if (e.key === 'ArrowUp') {
                thisPlayer.setMovingY(-1);
            } else if (e.key === 'ArrowDown') {
                thisPlayer.setMovingY(1);
            }
        });

        document.addEventListener("keyup", e => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                thisPlayer.setMovingX(0);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                thisPlayer.setMovingY(0);
            } 
        })
    }

}

// class RandomAIInputController implements PlayerController {

// }

