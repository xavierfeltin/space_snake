import { WorldState } from "./world_state";
import { Agent } from "./agent";
import * as tf from "@tensorflow/tfjs";
import { MyMath } from "../utils/math";

export class BasicAgent implements Agent {

    private model: tf.LayersModel;
    private model_optimizer: tf.AdamOptimizer;
    private nbInputs = 26;
    private nbActions = 3;

    constructor() {
        // Create the model
        // Input
        const input = tf.input({batchShape: [null, this.nbInputs]});
        // Hidden layer
        const layer0 = tf.layers.dense({useBias: true, units: 32, activation: 'relu'}).apply(input);
        // Hidden layer
        const layer = tf.layers.dense({useBias: true, units: 32, activation: 'relu'}).apply(layer0);
        // Output layer
        const output = tf.layers.dense({useBias: true, units: this.nbActions, activation: 'linear'}).apply(layer) as tf.SymbolicTensor;
        // Create the model
        this.model = tf.model({inputs: input, outputs: output});
        // Optimize
        this.model_optimizer = tf.train.adam(0.01);
    }

    // Loss of the model
    private model_loss(tf_states: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[], tf_actions: any, Qtargets: any): any{
        return tf.tidy(() => {
            // valeur
            const prediction = this.model.predict(tf_states) as tf.Tensor<tf.Rank>;
            return prediction.sub(Qtargets).square().mul(tf_actions).mean();
        });
    }

    // Train the model
    public train_model(states: tf.TensorLike2D, actions: tf.TensorLike2D, rewards: tf.TensorLike2D, next_states: tf.TensorLike2D): number | null{
        var size = next_states.length;
        // Transform each array into a tensor
        let tf_states = tf.tensor2d(states, [states.length, this.nbInputs]);
        let tf_rewards = tf.tensor2d(rewards, [rewards.length, 1]);
        let tf_next_states = tf.tensor2d(next_states, [next_states.length, this.nbInputs]);
        let tf_actions = tf.tensor2d(actions, [actions.length, this.nbActions]);
        // Get the list of loss to compute the mean later in this function
        let losses: any[] = []

        // Get the QTargets
        const Qtargets = tf.tidy(() => {
            let Q_stp1 = this.model.predict(tf_next_states) as tf.Tensor<tf.Rank>;
            let futureEsperances = Q_stp1.max(1).expandDims(1).mul(tf.scalar(0.99)).add(tf_rewards).bufferSync().values;
            let Qtargets = tf.tensor2d(futureEsperances, [size, 1]);
            return Qtargets;
        });

        // Generate batch of training and train the model
        let batch_size = 32;
        for (var b = 0; b < size; b+=32) {

            // Select the batch
            let to = (b + batch_size < size) ?  batch_size  : (size - b);
            const tf_states_b = tf_states.slice(b, to);
            const tf_actions_b = tf_actions.slice(b, to);
            const Qtargets_b = Qtargets.slice(b, to);

            // Minimize the error
            this.model_optimizer.minimize(() => {
                const loss = this.model_loss(tf_states_b, tf_actions_b, Qtargets_b);
                losses.push(loss.bufferSync().values[0]);
                return loss;
            });

            // Dispose the tensors from the memory
            tf_states_b.dispose();
            tf_actions_b.dispose();
            Qtargets_b.dispose();
        }

        // Dispose the tensors from the memory
        Qtargets.dispose();
        tf_states.dispose();
        tf_rewards.dispose();
        tf_next_states.dispose();
        tf_actions.dispose();

        return  MyMath.mean(losses);
    }

    // Pick an action eps-greedy
    public pickAction(worldState: WorldState, epsilon: number): number{
        if (Math.random() < epsilon){ // Pick a random action
            return Math.floor(Math.random() * this.nbActions);
        }
        else {
            let st = worldState.state;
            let st_tensor = tf.tensor([st]);
            let result = this.model.predict(st_tensor) as tf.Tensor<tf.Rank>;
            let argmax = result.argMax(1);
            let act = argmax.bufferSync().values[0];

            argmax.dispose();
            result.dispose();
            st_tensor.dispose();
            return act;
        }
    }

    public exploit(world: WorldState): string {
        const actions = ['left', 'right'];
        const index =  Math.floor(Math.random() * 2);
        return actions[index];
    }
}