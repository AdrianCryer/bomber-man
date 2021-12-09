import { EventEmitter } from "stream";
import { Direction } from "../model/types";


export default class UserController {
    socket: EventEmitter;

    constructor(socket: EventEmitter) {
        this.socket = socket;
    }

    public setup() {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') {
                this.socket.emit("", { direction: Direction.RIGHT });
            } else if (e.key === 'ArrowLeft') {
                this.socket.emit("set_moving", { direction: Direction.LEFT });
            } else if (e.key === 'ArrowUp') {
                this.socket.emit("set_moving", { direction: Direction.UP });
            } else if (e.key === 'ArrowDown') {
                this.socket.emit("set_moving", { direction: Direction.DOWN });
            } else if (e.code === 'Space') {
                this.socket.emit("place_bomb");
            }
        });

        document.addEventListener("keyup", e => {
            // if (thisPlayer.wantsToMove && thisPlayer.movingDirection === keyMap[e.key]) {
            //     thisPlayer.wantsToMove = false;
            // }
        });
    }

}