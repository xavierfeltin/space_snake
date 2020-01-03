import { IComponent } from '../ecs_engine';

export class HasToBeDeleted implements IComponent {
    kind = 'HasToBeDeleted';

    constructor() {}
}