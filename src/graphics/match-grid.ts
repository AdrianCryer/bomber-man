import * as PIXI from "pixi.js";
import Match, { Bomb, ExplosionCell, PowerUp } from "../model/match";
import Player from "../player";
import { GameRenderable } from "../types";
import { AbsoluteContainer } from "./absolute-container";

export default class MatchGrid extends AbsoluteContainer {

    explosions: GameRenderable<ExplosionCell, PIXI.Sprite>;
    bombs: GameRenderable<Bomb, PIXI.Sprite>;
    powerup: GameRenderable<PowerUp, PIXI.Graphics>;
    players: GameRenderable<Player, PIXI.Graphics>;

    constructor(match: Match) {
        super();
    }

    resize() {
        throw new Error("Method not implemented.");
    }

    mutate(match: Match) {
        // Basically reconfigure view and 
    }

    draw() {
        
    }
}