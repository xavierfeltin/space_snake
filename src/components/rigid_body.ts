import { IComponent } from '../ecs_engine';

export class RigidBody implements IComponent {
    kind = 'RigidBody';

    public radius: number;
    constructor(r: number) {
        this.radius = r;
    }
}