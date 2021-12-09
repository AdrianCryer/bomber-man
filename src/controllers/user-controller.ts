import { EventEmitter } from "stream";
import { Direction } from "../types";


export default class UserController {

    public setup(bridge: EventEmitter) {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') {
                bridge.emit("", { direction: Direction.RIGHT });
            } else if (e.key === 'ArrowLeft') {
                bridge.emit("set_moving", { direction: Direction.LEFT });
            } else if (e.key === 'ArrowUp') {
                bridge.emit("set_moving", { direction: Direction.UP });
            } else if (e.key === 'ArrowDown') {
                bridge.emit("set_moving", { direction: Direction.DOWN });
            } else if (e.code === 'Space') {
                bridge.emit("place_bomb");
            }
        });

        document.addEventListener("keyup", e => {
            // if (thisPlayer.wantsToMove && thisPlayer.movingDirection === keyMap[e.key]) {
            //     thisPlayer.wantsToMove = false;
            // }
        });
    }

}