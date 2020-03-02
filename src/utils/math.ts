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
}