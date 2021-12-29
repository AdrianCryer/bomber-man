import { Text, Rectangle } from "pixi.js";
import VersusMatch from "../../model/gamemodes/versus-match";
import { Resources } from "../../util/types";
import RoomScreen from "../screens/room-screen";
import ScreenManager from "../screens/screen-manager";
import Screen from "../screens/screen";
import { IMatchUpdatable } from "./match-updatable";

export default class VersusView extends Screen implements IMatchUpdatable {
    
    screenManager: ScreenManager;
    roomScreen: RoomScreen;
    lastMatchState: VersusMatch;
    countdownClock: Text;
    playerId: string;
    resources: Resources;

    constructor(bounds: Rectangle, initialMatch: VersusMatch, playerId: string, resources: Resources) {
        super(bounds);
        this.lastMatchState = initialMatch;
        this.playerId = playerId;
        this.resources = resources;
        this.roomScreen = new RoomScreen(bounds, resources, initialMatch.room, this.playerId);

        this.addChild(this.roomScreen);
    }

    onUpdate(match: VersusMatch) {

        this.roomScreen.updateRoom(match.room);
    }
}