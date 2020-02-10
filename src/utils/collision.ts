import { Vect2D } from "./vect2D";

export interface Collision {
    idA: string,
    idB: string,
    posA: Vect2D,
    posB: Vect2D,
    velA: Vect2D,
    velB: Vect2D,
    radiusA: number,
    radiusB: number,
    collisionTime: number
};

export class CollisionHelper {

    public static createCollision( idA: string, idB: string, pA: Vect2D,
        pB: Vect2D, vA: Vect2D, vB: Vect2D, rA: number,
        rB: number, time: number): Collision {
        return {
            idA: idA,
            idB: idB,
            posA: pA,
            posB: pB,
            velA: vA,
            velB: vB,
            radiusA: rA,
            radiusB: rB,
            collisionTime: time
        }
    }

    public static createEmptyCollision(): Collision {
        return {
            idA: '',
            idB: '',
            posA: new Vect2D(-1,-1),
            posB: new Vect2D(-1,-1),
            velA: new Vect2D(-1,-1),
            velB: new Vect2D(-1,-1),
            radiusA: -1,
            radiusB: -1,
            collisionTime: -1
        };
    }

    public static isCollisionEmpty(c: Collision): boolean {
        const emptyVector = new Vect2D(-1, -1);
        return c.posA.eq(emptyVector) && c.posB.eq(emptyVector) && c.velA.eq(emptyVector) && c.velB.eq(emptyVector) && c.radiusA == -1 && c.radiusB == -1 && c.collisionTime == -1;
    }

    public static areIdenticCollisions(collA: Collision, collB: Collision): boolean {
        return (
                ( collA.posA.eq(collB.posA)
                  && collA.posB.eq(collB.posB)
                  && collA.velA.eq(collB.velA)
                  && collB.velB.eq(collB.velB)
                  && collA.radiusA == collB.radiusA
                  && collA.radiusB == collB.radiusB
                )
                || ( collA.posA.eq(collB.posB)
                    && collA.posB.eq(collB.posA)
                    && collA.velA.eq(collB.velB)
                    && collB.velB.eq(collB.velA)
                    && collA.radiusA == collB.radiusB
                    && collA.radiusB == collB.radiusA
                )
            )
        && collA.collisionTime == collB.collisionTime;
    }

    public static detectCollision(
        idA: string, idB: string,
        posA: Vect2D, posB: Vect2D,
        velA: Vect2D, velB: Vect2D,
        radiusA: number, radiusB: number,
        previousCollision: Collision): Collision {

        // Collision is not possible if ships are going in opposite directions
        let collision: Collision = CollisionHelper.createEmptyCollision();

        if ((posA.x < posB.x && velA.x < 0.0 && velB.x > 0.0)
            || (posB.x < posA.x && velB.x < 0.0 && velA.x > 0.0)
            || (posA.y < posB.y && velA.y < 0.0 && velB.y > 0.0)
            || (posB.y < posA.y && velB.y < 0.0 && velA.y > 0.0)) {
            collision = CollisionHelper.createEmptyCollision();
        }
        else {
            collision = CollisionHelper.getCollsion(idA, idB, posB, posA, velB, velA, radiusB, radiusA);
        }

        if (!CollisionHelper.isCollisionEmpty(collision)) {
            if (!CollisionHelper.isCollisionEmpty(previousCollision)
                && CollisionHelper.areIdenticCollisions(collision, previousCollision)) {
                return CollisionHelper.createEmptyCollision();
            } else {
                return collision;
            }
        }

        return collision;
    }

    public static getCollsion(
        idA: string, idB: string,
        posA: Vect2D, posB: Vect2D,
        veloA: Vect2D, veloB: Vect2D,
        radiusA: number, radiusB: number): Collision {
        // Use square distance to avoid using root function
        const distanceToOther = posA.distance2(posB);
        const radii = (radiusA + radiusB);
        const radiiSquared = radii * radii;

        if (distanceToOther <= radiiSquared) {
            // Units are already in contact so there is an immediate collision
            return CollisionHelper.createCollision(idA, idB, posA, posB, veloA, veloB, radiusA, radiusB, 0.0);
        }

        // Optimisation : units with the same vector speed will never collide
        if (veloA.eq(veloB)) {
            return CollisionHelper.createEmptyCollision();
        }

        if (distanceToOther > 100) {
            return CollisionHelper.createEmptyCollision();
        }

        // Set other unit as the new reference (other is stationary and is positionned at (0, 0)
        const vObjARef = Vect2D.sub(posA, posB);
        const vObjBRef = new Vect2D(0, 0);
        const dVelo = Vect2D.sub(veloA, veloB);

        // Get the closest point to other unit (which is in (0,0)) on the line described by the pod speed vector
        // closest_projection = other_in_referential.get_closest(pod_in_referential, Point(x + vx, y + vy))
        const vClosestProjection = CollisionHelper.getClosestPoint(vObjBRef, vObjARef, Vect2D.add(posA, veloA));

        // Distance(squared) between the other unit and the closest point to the other unit on the line described by our speed vector
        const distanceUnitClosestProjection = vObjBRef.distance2(vClosestProjection);

        // Distance(squared) between the pod and the projection
        let distancePodClosestProjection = vObjARef.distance2(vClosestProjection);

        // If the distance between other unit and this line is less than the sum of the radii, there might be a collision
        if (distanceUnitClosestProjection <= radiiSquared) {
            // The pod speed on the line (norm)
            const speedDistance = dVelo.norm;

            // Project the pod on the line to find the point of impact
            const distanceIntersectionUnits = Math.sqrt(radiiSquared - distanceUnitClosestProjection);
            vClosestProjection.x = vClosestProjection.x - distanceIntersectionUnits * (dVelo.x / speedDistance);
            vClosestProjection.y = vClosestProjection.y - distanceIntersectionUnits * (dVelo.y / speedDistance);

            // If the projection point is further away means the pod direction is opposite of the other unit
            // => no collision will happen
            const updatedDistancePodClosestProjection = vObjARef.distance2(vClosestProjection);
            if ( updatedDistancePodClosestProjection > distancePodClosestProjection) {
                return CollisionHelper.createEmptyCollision();
            }

            distancePodClosestProjection = Math.sqrt(updatedDistancePodClosestProjection);

            // If the impact point is further than what the pod can travel in one turn
            // Collision will be managed in another turn
            if (distancePodClosestProjection > speedDistance) {
                return CollisionHelper.createEmptyCollision();
            }

            // Get the time needed to reach the impact point during this turn
            const t = (distancePodClosestProjection / speedDistance);

            if (t > 1.0) {
                return CollisionHelper.createEmptyCollision(); // no taking into account late collision
            }
            return CollisionHelper.createCollision(idA, idB, posA, posB, veloA, veloB, radiusA, radiusB, t);
        } else {
            return CollisionHelper.createEmptyCollision();
        }
    }

    // Get the closest point projected on the line (AB) for the point P
    public static getClosestPoint(P: Vect2D, A: Vect2D, B: Vect2D): Vect2D {
        const ax = A.x;
        const bx = B.x;
        const ay = A.y;
        const by = B.y;

        const da = by - ay;
        const db = ax - bx;
        const c1 = da * ax + db * ay;
        const c2 = -db * P.x + da * P.y;
        const det = da * da + db * db;

        let closestPointX = 0;
        let closestPointY = 0;
        if (det === 0) {
            // Point is already on the line (ab)
            closestPointX = P.x;
            closestPointY = P.y;
        } else {
            // Compute orthogonal projection of current point on the line (ab)
            closestPointX = (da * c1 - db * c2) / det;
            closestPointY = (da * c2 + db * c1) / det;
        }

        return new Vect2D(closestPointX, closestPointY);
    }
}