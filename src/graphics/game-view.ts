import { AbsoluteContainer } from "./absolute-container";
import Modal from "./modal";
import StatusBoard from "./statusboard";



class GameView extends AbsoluteContainer {

    // Grid

    statusBoard: StatusBoard;
    // grid: Playable
    gameOverModal: Modal;
    winModal: Modal;
    levelSelector: Modal;
    menu: Modal;

    constructor() {
        super();
    }

    resize() {

    }

}