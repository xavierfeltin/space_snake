import { WorldState } from "./world_state";
import { Agent } from "./agent";
import * as tf from '@tensorflow/tfjs';
import { Tensor, Rank } from "@tensorflow/tfjs";

export class BasicAgent implements Agent {

    private model: tf.LayersModel;
    private model_optimizer: tf.AdamOptimizer;

    constructor() {
        // Create the model
        // Input
        const input = tf.input({batchShape: [null, 25]});
        // Hidden layer
        const layer = tf.layers.dense({useBias: true, units: 32, activation: 'relu'}).apply(input);
        // Output layer
        const output = tf.layers.dense({useBias: true, units: 2, activation: 'linear'}).apply(layer) as tf.SymbolicTensor;
        // Create the model
        this.model = tf.model({inputs: input, outputs: output});
        // Optimize
        this.model_optimizer = tf.train.adam(0.01);
    }

    // Loss of the model
    private model_loss(tf_states: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[], tf_actions: any, Qtargets: any): any{
        return tf.tidy(() => {
            // valeur
            const prediction = this.model.predict(tf_states) as Tensor<Rank>; 
            return prediction.sub(Qtargets).square().mul(tf_actions).mean();
        });
    }

    // Pick an action eps-greedy
    public async pickAction(worldState: WorldState, epsilon: number): Promise<string>{
        const actions = ['left', 'right'];        
        if (Math.random() < epsilon){ // Pick a random action
            return actions[Math.floor(Math.random()*2)];
        }
        else {
            let st = worldState.state;
            let st_tensor = tf.tensor([st]);
            let result = this.model.predict(st_tensor) as Tensor<Rank>;
            let argmax = result.argMax(1);
            let act = (await argmax.buffer()).values[0];
            
            argmax.dispose();
            result.dispose();
            st_tensor.dispose();
    
            console.log("ended: " + act);                
            return actions[act];
        }        
    }

    public exploit(world: WorldState): string {
        const actions = ['left', 'right'];
        const index =  Math.floor(Math.random() * 2);
        return actions[index];
    }
}