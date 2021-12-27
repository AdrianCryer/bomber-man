import Heap from 'heap-js';
import { Position, Size } from "./types";

type HeapItem = { position: Position; score: number };
type HeuristicFunction = (position: Position) => number;

export class AStar {

    static findPath(
        gridDimensions: Size,
        getNeighbours: (position: Position) => Position[],
        costFunction: (pos: Position) => number,
        start: Position, 
        goal: Position, 
        heuristic: HeuristicFunction): Position[] {

        const containsComparator = (a: HeapItem, b: HeapItem) => Position.equals(a.position, b.position);
        const scoreComparator = (a: HeapItem, b: HeapItem) => a.score - b.score;

        const heap = new Heap<HeapItem>(scoreComparator);
        let preceeding = new Map<Position, Position>();

        const { height, width } = gridDimensions;
        let gScore = [];
        let fScore = [];
        for (let i = 0; i < height; i++) {
            gScore[i] = new Array(width);
            fScore[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                gScore[i][j] = Infinity;
                fScore[i][j] = Infinity;
            }
        }

        gScore[start.y][start.x] = 0;
        fScore[start.y][start.x] = heuristic(start);

        heap.push({ score: heuristic(start), position: start });

        while (!heap.isEmpty()) {

            let { position } = heap.pop();
            if (Position.equals(position, goal)) {
                let path: Position[] = [position];
                let current = position;
                while (preceeding.has(current) && !Position.equals(current, start)) {
                    current = preceeding.get(current);
                    path.push(current);
                }
                return path.reverse();
            }

            for (let neighbor of getNeighbours(position)) {

                let tentative_gScore = 
                    gScore[position.y][position.x] + costFunction(neighbor);

                if (tentative_gScore < gScore[neighbor.y][neighbor.x]) {

                    preceeding.set(neighbor, position);
                    gScore[neighbor.y][neighbor.x] = tentative_gScore;
                    fScore[neighbor.y][neighbor.x] = tentative_gScore + heuristic(neighbor);

                    const next = { 
                        position: neighbor, 
                        score: fScore[neighbor.y][neighbor.x]
                    };

                    heap.remove(next, containsComparator);
                    heap.push(next);
                }
            }
        }
        return [];
    }
}