import { Rectangle, Container } from 'pixi.js';

export class AbsoluteContainer extends Container {
    
    bounds: Rectangle;

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.setBounds(new Rectangle(x, y, width, height));        
    }

    setBounds(bounds: Rectangle) {
        this.bounds = bounds;
    }

    getBounds(): Rectangle {
        return this.bounds;
    }

    static fromParent(container: AbsoluteContainer) {
        const { x, y, width, height } = container.getBounds();
        return new AbsoluteContainer(x, y, width, height);
    } 
    
    static horizontalSplit(container: AbsoluteContainer, splitRatio: number): [left: Rectangle, right: Rectangle] {
        const { x, y, width, height } = container.getBounds();
        return [
            new Rectangle(x, y, width * splitRatio, height),
            new Rectangle(x + width * splitRatio, y, width * (1 - splitRatio), height),
        ];
    }
}