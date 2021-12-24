import { Position, Direction } from "../../util/types";
import { Movement } from "../behaviours/movement";
import Match from "../match";
import Player from "./player";
import { AStar } from "../../util/pathfinding";

export default class Bot extends Player {

    private strollDelay: number = 200;
    private lastMove: number = 0;
    private inAction: boolean = false;
    private currentMoveSequence: Position[] = [];
    private currentMoveIndex: number = 0;

    onUpdate(match: Match, time: number)  {

        const movement = this.getBehaviour(Movement);
        
        if (!this.inAction && !movement.inTransition) {
            // Randomly pick point
            const { width, height } = match.settings.map.props;
            let randomPosition: Position;
            while (!randomPosition || !match.positionIsTraversable(randomPosition)) {
                randomPosition = new Position(
                    Math.floor(Math.random() * width),
                    Math.floor(Math.random() * height)
                );
            }
            
            const currentPosition = this.position.round();
            const path = AStar.findPath(
                { width, height },
                (pos) => this.getTraversableNeighbours(match, pos),
                (pos) => 1,
                currentPosition,
                randomPosition,
                (pos) => Math.abs(randomPosition.x - pos.x) + Math.abs(randomPosition.y - pos.y)
            );

            if (path.length > 1) {
                this.currentMoveSequence = path;
                this.currentMoveIndex = 1;
                this.inAction = true;
                console.log("GOAL", randomPosition, this.currentMoveSequence)
            }
        } 
        
        if (this.inAction && !movement.inTransition) {
            const currentPos = this.position.round();
            console.log(currentPos, this.position, this.currentMoveSequence);
            if (Position.equals(this.currentMoveSequence[this.currentMoveIndex], currentPos)) {
                this.currentMoveIndex++;
                if (this.currentMoveIndex > this.currentMoveSequence.length - 1) {
                    this.currentMoveIndex = 1;
                    this.inAction = false;
                }
            }

            if (this.inAction) {
                const nextPos = this.currentMoveSequence[this.currentMoveIndex];
                console.log(this.position, nextPos);
                const deltaX = nextPos.x - currentPos.x;
                const deltaY = nextPos.y - currentPos.y;
    
                let direction: Direction;
                if (deltaX < 0) direction = Direction.LEFT;
                else if (deltaX > 0) direction = Direction.RIGHT;
                else if (deltaY < 0) direction = Direction.UP;
                else if (deltaY > 0) direction = Direction.DOWN;
                this.setMoving(direction);
            }

        }

        super.onUpdate(match, time);
    }

    getTraversableNeighbours(match: Match, position: Position): Position[] {
        let neighbours = [];
        for (let i = 0; i < 4; i++) {
            const direction = i as Direction;
            const nextPos = position.getNextPosition(direction);

            if (match.positionIsInBounds(nextPos) && match.positionIsTraversable(nextPos)) {
                neighbours.push(nextPos);
            }
        }
        return neighbours;
    }

    goTo(match: Match, start: Position, goal: Position) {


    }

    findNearestBrick() {
        // dfs?
    }

    goForPowerup() {

    }

    // For hard bots
    pushBomb() {

    }
}