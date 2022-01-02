import shortUUID from "short-uuid";

export interface Component<P> {
    onUpdate: (entity: Entity<P>) => void;
}

export interface ComponentClass<T extends Component<any>> {
    readonly name: string;
    new (...args: unknown[]): T;
}

export interface UpdateTree<P> {
    readonly id: string;
    readonly updated: boolean;
    readonly entity?: Partial<Entity<P>>;
    readonly events?: string[];
    readonly children?: UpdateTree<UpdateTree<P>>[];
}

/** 
 * Provide a way to filter state returned to an on update call.
 * 
 * A filter may conceal private internal state that should not be transmitted to
 * the user or reduce a potentially heavy payload
 */
export interface Filter<P> {
    apply(entity: Entity<P>): Partial<Entity<P>>;
}

export class EntityContainer<P> {
    ids: Set<string>;
}

export default abstract class Entity<P> {

    readonly parent: P;
    readonly children: { [id: string]: Entity<Entity<P>> };
    readonly components: { [tag: string]: Component<P>; };
    readonly id: string;

    constructor(parent: P, id?: string) {
        this.parent = parent;
        this.id = id || shortUUID.generate();
        this.children = {};
        this.components = {};
    }

    addChild(child: Entity<Entity<P>>): void {
        this.children[child.id] = child;
    }

    removeChild(entity: Entity<Entity<P>>) {
        const id = entity.id;
        delete this.children[id];
    }

    onUpdate() {
        for (let component of Object.values(this.components)) {
            component.onUpdate(this);
        }
        for (let child of Object.values(this.children)) {
            child.onUpdate();
        }
    }

    hasComponent<C extends Component<P>>(cls: ComponentClass<C>): boolean {
        return this.getComponent(cls) !== null;
    }

    getComponent<C extends Component<P>>(cls: ComponentClass<C>): C {
        const component = this.components[cls.name];
        if (!component) {
            return null;
        }
        return component as C;
    }

    addComponent<C extends Component<P>>(object: C) {
        const label = object.constructor.name;
        const component = this.components[label];
        if (component) {
            throw new Error("Behaviour already exists on the class exists");
        }
        this.components[label] = object;
    }

    getChildrenWithComponent<C extends Component<Entity<P>>>(cls: ComponentClass<C>): Entity<Entity<P>>[] {
        let result = [];
        for (let entity of Object.values(this.children)) {
            if (entity.hasComponent(cls)) {
                result.push(entity);
            }
        }
        return result;
    }

    getEntitiesWithComponent<C extends Component<any>>(cls: ComponentClass<C>): Entity<any>[] {
        function find(entity: Entity<any>, result: Entity<any>[]) {
            for (let child of Object.values(entity.children)) {
                if (child.hasComponent(cls)) {
                    result.push(entity);
                }
                find(child, result);
            }

        }
        let entities: Entity<any>[] = [];
        find(this, entities);
        return entities;
    }
}