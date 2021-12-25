import { Position, Direction } from "../../util/types";
import { Movement } from "../behaviours/movement";
import Match from "../match";
import Player from "./player";
import { AStar } from "../../util/pathfinding";
import Brick from "./brick";
import Queue from "queue-fifo";

/**
 * 
 * ACTIONS:
 *  Find Nearest Brick / Place bomb
 *  Hide from blast (Find safe square)
 *      If can find brick and place bomb safely / Go for powerup (preferred)
 *  Search for powerup
 *  Try Place bomb near player
 * 
 */

type ActionType = 'DESTROY_BRICK' | 'MOVE_TO_SAFETY' | 'SEARCH_FOR_POWERUP' | 'ATTACK_PLAYER';

type Action = {
    type: ActionType;
    sequence: {
        name: 'MOVE_TO' | 'PLACE_BOMB' | 'FLEE',
        position?: Position
    }[];
}

export default class Bot extends Player {

    private actionStack: Action[] = []
    private currentMoveSequence: Position[] = [];
    private currentMoveIndex: number = 0;
    private currentActionIndex: number = 0;
    private inMoveSequence: boolean = false;

    chooseNextAction(match: Match) {

        const position = this.position.round();
        const bombablePositions = this.findNearestSpaceAccessibleToBricks(match, position);

        this.actionStack.push({
            type: 'DESTROY_BRICK',
            sequence: [
                { name: 'MOVE_TO', position: bombablePositions[0] },
                { name: 'PLACE_BOMB' }
                // { name: 'FLEE' }
            ]
        });
        console.log("Added new action", this.actionStack);
    }

    moveTo(match: Match, to: Position): boolean {
        const { width, height } = match.settings.map.props;
        const from = this.position.round();
        const path = AStar.findPath(
            { width, height },
            (pos) => this.getTraversableNeighbours(match, pos),
            () => 1,
            from,
            to,
            (pos) => Math.abs(to.x - pos.x) + Math.abs(to.y - pos.y)
        );

        if (path.length === 0) {
            return false;
        }

        this.currentMoveSequence = path.slice(1);
        this.currentMoveIndex = 0;
        return true;
    }

    onUpdate(match: Match, time: number)  {

        const movement = this.getBehaviour(Movement);
        
        if (this.actionStack.length == 0) {
            this.chooseNextAction(match);
        }

        if (this.actionStack) {
            const currentAction = this.actionStack[this.actionStack.length - 1];
            const currentSequence = currentAction.sequence[this.currentActionIndex];
            
            if (currentSequence.name === 'MOVE_TO')  {
                if (!this.inMoveSequence && !movement.inTransition) {
                    const canMove = this.moveTo(match, currentSequence.position);
                    if (!canMove) {
                        console.log("CANT MOVE")
                    }
                    this.inMoveSequence = true;
                }

                if (this.inMoveSequence && !movement.inTransition) {
                    const currentPos = this.position.round();
                    if (Position.equals(this.currentMoveSequence[this.currentMoveIndex], currentPos)) {
                        this.currentMoveIndex++;
                        if (this.currentMoveIndex > this.currentMoveSequence.length - 1) {
                            this.inMoveSequence = false;
                            this.currentActionIndex++;
                            this.currentMoveIndex = 0;
                        }
                    }

                    if (this.inMoveSequence) {
                        const nextPos = this.currentMoveSequence[this.currentMoveIndex];
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
            } else if (currentSequence.name === 'PLACE_BOMB') {
                this.placeBomb();
                this.currentActionIndex++;
            }

            console.log(this.currentActionIndex, currentAction.sequence.length - 1)
            if (this.currentActionIndex > currentAction.sequence.length - 1) {
                this.actionStack.pop();
                this.currentActionIndex = 0;
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

    findNearestSpaceAccessibleToBricks(match: Match, position: Position): Position[] {

        let result: Position[] = [];

        if (match.positionIsBlocked(position)) {
            throw new Error("Starting Position is not traversable");
        }

        let seen = new Set();
        seen.add(`${position.x},${position.y}`);
        let topK = 1;

        // Really want BFS....
        let queue = new Queue<Position>();
        queue.enqueue(position);

        while (!queue.isEmpty() && topK > 0) {

            const current = queue.dequeue();

            let foundBrick = false;
            for (let i = 0; i < 4; i++) {
                const direction = i as Direction;
                const nextPos = current.getNextPosition(direction);
                
                if (!foundBrick) {
                    const entities = match.getEntitiesAtPosition(nextPos);
                    for (let entity of entities) {
                        if (entity instanceof Brick) {
                            topK -= 1;
                            result.push(current);
                            foundBrick = true;
                            break;
                        }
                    }
                }
                    
                if (match.positionIsInBounds(nextPos) && !match.positionIsBlocked(nextPos)) {
                    const key = `${nextPos.x},${nextPos.y}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        queue.enqueue(nextPos);
                    }
                }
            }
        }
        
        return result;
    }

    goForPowerup() {

    }

    // For hard bots
    pushBomb() {

    }
}