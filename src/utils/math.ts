import { Vect2D } from "./vect2D";

export class MyMath {
    public static isPointInRectangle(topLeftCorner: Vect2D, bottomRightCorner: Vect2D, point: Vect2D) {
        return (point.x >= topLeftCorner.x
            && point.x <= bottomRightCorner.x
            && point.y >= topLeftCorner.y
            && point.y <= bottomRightCorner.y);
    }

     // Return the mean of an array
     public static mean(array: number[]): number | null{
        if (array.length == 0)
            return null;
        var sum = array.reduce(function(a, b) { return a + b; });
        var avg = sum / array.length;
        return avg;
    }

    public static getDirectionFromAngle(angle: number): Vect2D {
        const rad = angle * Math.PI / 180;
        const vx = Math.cos(rad);
        const vy = Math.sin(rad);
        return new Vect2D(vx, vy);
    }

    // Return the cardinal direction the target is placed from the center
    // 0: North, 1: North East, 2: East, ....
    public static getCardinalDirection(center: Vect2D, direction: Vect2D, target: Vect2D): number {
        const ship = direction;
        ship.normalize();

        const toTargetVector = new Vect2D(target.x - center.x, target.y - center.y);
        toTargetVector.normalize();

        const angleDeg = toTargetVector.angleWithVector(direction) * 180 / Math.PI; // wwith normalized vector
        return -angleDeg;

        /*
        if (-5 < cosDeg && cosDeg < 5) {
            return 0;
        } else if (5 <= cosDeg && cosDeg < 70) {
            return 1;
        } else if (70 <= cosDeg && cosDeg < 115) {
            return 2
        } else if (115 <= cosDeg && cosDeg < 155) {
            return 3;
        } else if (155 <= cosDeg && -160 < cosDeg) {
            return 4;
        } else if (cosDeg <= -160 && -115 < cosDeg) {
            return 5;
        } else if (cosDeg <= -115 &&  -70 < cosDeg) {
            return 6;
        } else {
            return 7;
        }
        */
    }
}