import { Position, Direction } from "../../util/types";
import { Movement } from "../behaviours/movement";
import Match from "../room";
import Player from "./player";
import { AStar } from "../../util/pathfinding";
import Brick from "./brick";
import Bomb from "./bomb";
import Queue from "queue-fifo";
import { StatsConfig } from "../types";
import Damagable from "../behaviours/damagable";
import Explosion from "./explosion";

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

type ActionType = 'DESTROY_BRICK' | 'MOVE_TO_SAFETY' | 'SEARCH_FOR_POWERUP' | 'ATTACK_PLAYER' | 'WAIT';
type Action = {
    name: 'MOVE_TO' | 'PLACE_BOMB' | 'FLEE' | 'HALT' | 'MOVE_DIR';
    props?: any;
}

export default class Bot extends Player {

    private actionStack: Action[] = []
    private inAction: boolean = false;
    private currentMoveSequence: Position[] = [];
    private currentMoveIndex: number = 0;
    private seenBricks: Set<string> = new Set();

    constructor(id: string, initialPosition: Position, stats: StatsConfig) {
        super(id, initialPosition, stats);
        this.actionStack = [];
    }

    assessBombPlacement(match: Match, position: Position): number {
        // Assign each bomb placement a score

        // Assuming bomb has been placed, which has the quickest flee time

        return -1;
    }

    chooseNextAction(match: Match) {

        const position = this.position.round();
        const bombablePositionsGenerator = this.findNearestSpaceAccessibleToBricks(match, position);

        for (let position of bombablePositionsGenerator) {

            // Evaluate position.
            let newBrick = false;
            let newBrickIds = [];
            for (let i = 0; i < 4; i++) {
                const nextPos = position.getNextPosition(i as Direction);
                const entities = match.getEntitiesAtPosition(nextPos);
                for (let entity of entities) {
                    if (entity instanceof Brick) {
                        if (!this.seenBricks.has(entity.id)) {
                            newBrick = true;
                            newBrickIds.push(entity.id);
                            break;
                        }
                    }
                }
            }
            
            if (newBrick) {
                // this.actionStack.push({ name: 'FLEE' });
                this.actionStack.push({ name: 'PLACE_BOMB' });
                this.actionStack.push({
                    name: 'MOVE_TO',
                    props: {
                        position
                    }
                });
                for (let id of newBrickIds) {
                    this.seenBricks.add(id);
                }
                break;
            }
        }
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

    isPositionDangerous(match: Match, position: Position) {
        // for (let cell )
        // I
    }

    onUpdate(match: Match, time: number)  {

        const movement = this.getBehaviour(Movement);

        if (this.actionStack.length == 0) {
            console.log("No move")
            this.chooseNextAction(match);
        }
        
        if (this.actionStack.length > 0) {
            const action = this.actionStack[this.actionStack.length - 1];

            // Handle action
            if (!this.inAction) {

                console.log('starting action', action.name, action)
                if (action.name === 'MOVE_DIR') {
                    const { units, direction } = action.props;
                    movement.setMoving(direction, units);
                    this.inAction = true;
                    
                } else if (action.name === 'MOVE_TO') {
                    const { position } = action.props;
                    const canMove = this.moveTo(match, position);
                    
                    if (!canMove) {
                        this.actionStack.pop();
                        throw new Error(`Cannot traverse to position ${[position.x, position.y]}`);
                    } else {
                        this.inAction = true;
                    }
                } else if (action.name === 'PLACE_BOMB') {
                    this.placeBomb();
                    this.inAction = false;
                    this.actionStack.pop();
                }
            }

            // Handle actions
            if (this.inAction) {

                let terminateAction = false;
                if (action.name === 'MOVE_DIR' && !movement.wantsToMove) {
                    terminateAction = true;
                } else if (action.name === 'MOVE_TO') {

                    const currentPosition = this.position.round();
                    if (!movement.inTransition) {
                        if (Position.equals(this.currentMoveSequence[this.currentMoveIndex], currentPosition)) {

                            this.currentMoveIndex++;
                            
                            // Check if we need to recalculate the path
                            // if (this.isPositionDangerous(currentPosition)) {
                                // this.flee()
                            // }
                            
                            if (this.currentMoveIndex > this.currentMoveSequence.length - 1) {
                                this.inAction = false;
                                this.currentMoveIndex = 0;
                                this.currentMoveSequence = [];
                                terminateAction = true;
                            }
                        }

                        if (this.inAction) {
                            const nextPos = this.currentMoveSequence[this.currentMoveIndex];
                            const deltaX = nextPos.x - currentPosition.x;
                            const deltaY = nextPos.y - currentPosition.y;
                
                            let direction: Direction;
                            if (deltaX < 0) direction = Direction.LEFT;
                            else if (deltaX > 0) direction = Direction.RIGHT;
                            else if (deltaY < 0) direction = Direction.UP;
                            else if (deltaY > 0) direction = Direction.DOWN;
                            movement.setMoving(direction, 1);
                        }
                    }
                }

                if (terminateAction) {
                    this.inAction = false;
                    this.actionStack.pop();
                }
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

        // Avoid damage
        for (let entity of Object.values(match.entitities)) {
            if (entity instanceof Explosion) {
                const explosion = entity as Explosion;
                neighbours.filter(p => !explosion.isExplosionCell(p));
            }
        }

        return neighbours;
    }

    *findNearestSpaceAccessibleToBricks(match: Match, position: Position): IterableIterator<Position> {

        let seen = new Set();
        seen.add(`${position.x},${position.y}`);
        let topK = 1;

        let queue = new Queue<Position>();
        queue.enqueue(position);

        while (!queue.isEmpty() && topK > 0) {

            const current = queue.dequeue();

            let foundBrick = false;
            for (let i = 0; i < 4; i++) {
                const direction = i as Direction;
                const nextPos = current.getNextPosition(direction);
                
                if (!foundBrick && !Position.equals(current, position)) {
                    const entities = match.getEntitiesAtPosition(nextPos);
                    for (let entity of entities) {
                        if (entity instanceof Brick) {
                            yield current;
                            foundBrick = true;
                            break;
                        }
                    }
                }
                    
                if (match.positionIsInBounds(nextPos) && match.positionIsTraversable(nextPos)) {
                    const key = `${nextPos.x},${nextPos.y}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        queue.enqueue(nextPos);
                    }
                }
            }
        }
    }

    goForPowerup() {

    }

    // For hard bots
    pushBomb() {

    }
}