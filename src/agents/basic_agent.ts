import { WorldState } from "./world_state";
import { Agent } from "./agent";

export class BasicAgent implements Agent {
    constructor() {}

    public exploit(world: WorldState): string {
        const actions = ['left', 'right'];
        const index =  Math.floor(Math.random() * 2);
        return actions[index];
    }
}