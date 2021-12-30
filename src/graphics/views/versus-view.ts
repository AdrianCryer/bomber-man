import { Text, Rectangle, TextStyle } from "pixi.js";
import VersusMatch from "../../model/gamemodes/versus-match";
import { Resources } from "../../util/types";
import RoomScreen from "../screens/room-screen";
import ScreenManager from "../screens/screen-manager";
import Screen from "../screens/screen";
import { IMatchUpdatable } from "./match-updatable";
import { ease } from "pixi-ease";

const fontStyle = new TextStyle({
    fontFamily: "oldschool",
    fontStyle: "normal",
    fill: "white",
    dropShadow: true,
    dropShadowAngle: 0.57,
    dropShadowDistance: 3,
    fontSize: 80,
    strokeThickness: 3
});

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

        this.setupCountDownClock();
    }

    setupCountDownClock() {
        this.countdownClock = new Text("TIMER", fontStyle);
        this.countdownClock.position.set(this.getBounds().width / 2, this.getBounds().height / 2);
        this.countdownClock.anchor.set(0.5);
        this.countdownClock.visible = false;
        ease.add(this.countdownClock, { scaleX: 1.3, scaleY: 1.3 }, { repeat: true, reverse: true });

        this.addChild(this.countdownClock);
    }

    onUpdate(match: VersusMatch) {
        if (match.countDownActive) {
            this.countdownClock.visible = true;
            this.countdownClock.text = match.getCountDownSeconds(match.time).toString();
        } else {
            this.countdownClock.visible = false;
            this.roomScreen.updateRoom(match.room);
        }
    }
}