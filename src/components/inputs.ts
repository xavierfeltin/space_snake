import { IComponent } from '../ecs_engine';

export class Inputs implements IComponent {
    kind = 'Inputs';

    public inputs: string[];
    constructor() {
        this.inputs = [];
    }

    addInput(i: string) {
        this.inputs.push(i);
    }

    reset() {
        this.inputs = [];
    }
}