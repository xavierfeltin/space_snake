import { Vect2D } from "./vect2D";

export class MyMath {
    public static isPointInRectangle(topLeftCorner: Vect2D, bottomRightCorner: Vect2D, point: Vect2D) {
        return (point.x >= topLeftCorner.x
            && point.x <= bottomRightCorner.x
            && point.y >= topLeftCorner.y
            && point.y <= bottomRightCorner.y);
    }
}