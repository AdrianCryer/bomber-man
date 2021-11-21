import Game from "./game";
import Player from "./player";
export interface PlayerController {
    setup: (view: Game, thisPlayer: Player) => void;
}
export declare class UserInputController implements PlayerController {
    setup(game: Game, thisPlayer: Player): void;
}
