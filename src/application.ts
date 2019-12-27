import { EntityManager } from "./ecs_engine";
import { UpdateContext } from "./update_context";
import { Move } from "./systems/move";
import { Ship } from "./components/ship";
import { Beacon } from "./components/beacon";
import { Area } from "./components/area";
import { Position } from "./components/position";
import { Velocity } from "./components/velocity";
import { Orientation } from "./components/orientation";
import { RenderArea } from "./systems/render_area";
import { Renderer } from "./components/renderer";
import { RenderShip } from "./systems/render_ship";
import { RenderBeacon } from "./systems/render_beacon";
import { Orientate } from "./systems/orientate";
import { UpdateInstruments } from "./systems/update_instruments";
import { Solve } from "./systems/solve";
import { Turn } from "./systems/turn";
import { Speed } from "./components/speed";
import { Radar } from "./components/radar";

export class Application {
    private em: EntityManager<UpdateContext>;
    private canvas2D: CanvasRenderingContext2D;
    private idArea: string;
    private id1: string;
    private id2: string;

    // animation variables
    private startTime: number;
    private now: number;
    private delta: number;
    private then: number;
    private interval: number;
    private fps: number;

    public constructor(canvas: CanvasRenderingContext2D) {
        // global context
        this.canvas2D = canvas;
        this.startTime = 0;
        this.now = 0;
        this.delta = 0;
        this.then = 0;
        this.fps = 30;
        this.interval = 1000 / this.fps;

        this.em = new EntityManager<UpdateContext>();
        this.em.addSystem(new Solve());
        this.em.addSystem(new Turn());
        this.em.addSystem(new Orientate());
        this.em.addSystem(new Move());
        this.em.addSystem(new UpdateInstruments());
        this.em.addSystem(new RenderArea());
        this.em.addSystem(new RenderBeacon());
        this.em.addSystem(new RenderShip());

        this.idArea = this.em.addEntity([
            new Area(1200, 800),
            new Position([0, 0]),
            new Renderer('(0,0,0)', 1200, 800)
        ])

        // this one will move
        this.id1 = this.em.addEntity([
            new Ship(),
            new Speed(10),
            new Position([400, 400]),
            new Velocity([1, 0]),
            new Orientation(0),
            new Radar(100, 5, 6, [400, 400])
        ]);

        // this one will be static
        this.id2 = this.em.addEntity([
            new Beacon(),
            new Position([200, 100]),
            new Renderer('(0,0,0)', 100, 100)
        ]);
    }

    public run(): void {
        this.startTime = Date.now();
        this.now = this.startTime;

        // Need to have an initialization at this moment
        // to allow charts to be initialized with correct values
        // yes I know could be better ...
        //this.initialize();
        //this.game.start();

        window.requestAnimationFrame(() => this.animate());
    }

    private animate(): void {
        window.requestAnimationFrame(() => this.animate());

        this.now = Date.now();
        this.delta = this.now - this.then;

        if (this.delta > this.interval) {
            // update time stuffs

            // From: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
            this.then = this.now - (this.delta % this.interval);

            this.em.update({
                deltaTime: this.interval,
                canvas2D: this.canvas2D
            });
        }
    }
}