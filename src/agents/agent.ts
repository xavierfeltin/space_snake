import { WorldState } from "./world_state";
import * as tf from "@tensorflow/tfjs";

export abstract class Agent {
    constructor() {}
    public abstract pickAction(worldState: WorldState, epsilon: number): number;
    public abstract train_model(states: tf.TensorLike2D, actions: tf.TensorLike2D, rewards: tf.TensorLike2D, next_states: tf.TensorLike2D): number | null;
}