import { EventEmitter } from "stream";
import { Direction } from "../model/types";

const keyMap : { [key: string]: Direction } = {
    'ArrowRight': Direction.RIGHT,
    'ArrowLeft': Direction.LEFT,
    'ArrowUp': Direction.UP,
    'ArrowDown': Direction.DOWN,
};

export default class UserController {
    socket: EventEmitter;

    constructor(socket: EventEmitter) {
        this.socket = socket;
    }

    public setup() {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') {
                this.socket.emit("set_moving", Direction.RIGHT);
            } else if (e.key === 'ArrowLeft') {
                this.socket.emit("set_moving", Direction.LEFT);
            } else if (e.key === 'ArrowUp') {
                this.socket.emit("set_moving", Direction.UP);
            } else if (e.key === 'ArrowDown') {
                this.socket.emit("set_moving", Direction.DOWN);
            } else if (e.code === 'Space') {
                this.socket.emit("place_bomb");
            }
        });

        document.addEventListener("keyup", e => {
            this.socket.emit("stop_moving", keyMap[e.key]);
        });
    }

}