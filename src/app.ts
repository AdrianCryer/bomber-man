import * as PIXI from "pixi.js";
import Game, { GameSettings } from "./game"; 
import GameMap from "./game-map";

import basicMap from "../maps/basic.txt";
import retroMap from "../maps/retro.txt";
import testMap from "../maps/test.txt";
import { SCALE_MODES } from "pixi.js";

const app = new PIXI.Application({
    width: 1600,
    height: 900,
    antialias: false
});
app.renderer.backgroundColor = 0xaaaaaa;
document.getElementById("game").appendChild(app.view);

// PIXI.settings.ROUND_PIXELS = true;
// PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;

app.loader.add("solid", "../assets/solid-sprite.png");
app.loader.add("open", "../assets/open-sprite.png");
app.loader.add("brick", "../assets/brick-sprite.png");
app.loader.add("bomb", "../assets/bomb-spritesheet.json");
app.loader.load(run);

async function run() {

    const mapString = await GameMap.loadMapFile(retroMap);
    const settings: GameSettings = {
        map: GameMap.loadFromFile(mapString),
        bots: 2,
        difficulty: 'easy',
        initialSpeed: 5,
        speedCap: 10,
        tickrate: 64,
        brickSpawnPercentage: 0.3
    };

    const game = new Game(app, settings);
    game.start()
}