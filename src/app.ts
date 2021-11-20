import * as PIXI from "pixi.js";
import Game, { GameSettings } from "./game"; 
import GameMap from "./game-map";

import basicMap from "../maps/basic.txt";

const app = new PIXI.Application({
    width: 1600,
    height: 900,
    antialias: true
});
app.renderer.backgroundColor = 0xaaaaaa;
document.getElementById("game").appendChild(app.view);

async function run() {

    const mapString = await GameMap.loadMapFile(basicMap);
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

run();