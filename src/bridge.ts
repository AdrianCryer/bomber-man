import { EventEmitter } from "stream";
import Game from "./model/game";
import GameView from "./graphics/game-view";
import UserController from "./controllers/user-controller";


export default class MVCBridge extends EventEmitter {

    model: Game;
    view: GameView;
    controller: UserController;

    constructor(model: Game, view: GameView, controller: UserController) {
        super();
        this.model = model;
        this.view = view;
        this.controller = controller;
    }

    setup() {

        // server
        this.on("start_match", () => {
            // this.model.
        });

        // client
        // this.controller.setup(this);
        // this.view.setup(this);
    }

    mutate() {
        this.emit("update", { game: this.model });
    }
}