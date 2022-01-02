import shortUUID from "short-uuid";
import Entity, { Component } from "./entity";


class GameMode extends Entity<{}> {

    constructor() {
        super(null);
    }

    onUpdate(): void {
        throw new Error("Method not implemented.");
    }
}

class Room extends Entity<GameMode> {

    onUpdate(): void {

        /** Manipulate the gamemode here */
        const gamemode = this.parent;


        throw new Error("Method not implemented.");
    }
}

class Bomb extends Entity<Room> {

    onUpdate(): void {
        const slidableComponent = this.getComponent(Slidable);
        slidableComponent.onUpdate(this);
    }
}

class Slidable implements Component<Room> {

    onUpdate: (entity: Entity<Room>) => void;
}

class Position implements Component<any> {
    onUpdate: (entity: Entity<any>) => void;
}


const gamemode = new GameMode();
const room = new Room(gamemode);

room.addComponent(new Position());

const bomb = new Bomb(room);

gamemode.addChild(room);
room.addChild(bomb);

bomb.parent.parent.parent;

const slidableEntities = room.getChildrenWithComponent(Slidable);
