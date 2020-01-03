import { IComponent } from '../ecs_engine';

export class FrameTime implements IComponent {
    kind = 'FrameTime';

    public time: number;
    constructor() {
        this.time = 0.0;
    }
}