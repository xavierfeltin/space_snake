import { IComponent } from '../ecs_engine';
import { Collision } from '../utils/utls';

export class Collisions implements IComponent {
    kind = 'Collisions';

    public collisions: Collision[];
    constructor() {
        this.collisions = [];
    }

    addCollision(c: Collision) {
        this.collisions.push(c);
    }

    reset() {
        this.collisions = [];
    }
}