"use strict";

/*
class for pathfinding algorithm
uses goal-based pathfinding
steps:
1. create heatmap: for each tile, create the minimum distance from tile to goal
2. create vector field: for each tile, create vectors pointing to the path of minimum distance
3. use vector field to make enemies travel towards player
*/

class PathfindingAlgorithm {
    static NEIGHBOURS = [
        new Vector2(1, 0),
        new Vector2(1, 1),
        new Vector2(0, 1),
        new Vector2(-1, 1),
        new Vector2(-1, 0),
        new Vector2(-1, -1),
        new Vector2(0, -1),
        new Vector2(1, -1)
    ];
    constructor(target, maxDistance, arena) {
        this.target = target;
        this.maxDistance = maxDistance;
        this.arena = arena;
        this.heatmap = {};
    }

    generateHeatMap() {
        this.heatmap = {};

        let currentX = this.target.getX();
        let currentY = this.target.getY();

        let distance = 0;

        let unvisitedNodes = [];
        this.heatmap[this.target.toString()] = distance;
        arrayPush(unvisitedNodes, this.target);

        while (unvisitedNodes.length != 0) {
            for (let node of PathfindingAlgorithm.NEIGHBOURS) {
                let point = new Vector2(currentX + node.getX(), currentY + node.getY());
                let pointString = point.toString();
                if (!this.arena.isWall(point)) {
                    let distanceFromPoint = (node.getX() != 0 && node.getY() != 0) ? distance + Math.SQRT2: distance + 1;
                    if (distanceFromPoint <= this.maxDistance) {
                        if (arrayIncludes(Object.keys(this.heatmap), point.toString())) {
                            if (this.heatmap[pointString] > distanceFromPoint) {
                                this.heatmap[pointString] = distanceFromPoint;
                                arrayPush(unvisitedNodes, point);
                            }
                        } else {
                            this.heatmap[pointString] = distanceFromPoint;
                            arrayPush(unvisitedNodes, point);
                        }
                    }
                } else {
                    this.heatmap[pointString] = 65535;
                }
            }
            if (unvisitedNodes.length != 0) {
                let newNode = unvisitedNodes[0];
                distance = this.heatmap[newNode];
                currentX = newNode.getX();
                currentY = newNode.getY();
                arrayDelete(unvisitedNodes, 0);
            }
        }
    }

    getVector(node) {
        if (this.heatmap == undefined) {
            this.generateHeatMap();
        }
        let neighbourVectors = [];
        for (let i = 0; i < PathfindingAlgorithm.NEIGHBOURS.length; i++) {
            let relativeNode = PathfindingAlgorithm.NEIGHBOURS[i];
            let coords = node.add(relativeNode);
            let coordsString = coords.toString();
            if (arrayIncludes(Object.keys(this.heatmap), coordsString)) {
                let distance = this.heatmap[coordsString];
                let vector = Vector2.fromPolarForm(Math.E ** (-1 * distance), i * 0.25 * Math.PI);
                arrayPush(neighbourVectors, vector);
            }
        }
        let vector = Vector2.ZERO_VECTOR;
        for (let v of neighbourVectors) {
            vector = vector.add(v);
        }
        return vector.unit();
    }

    getDecimalVector(position) {
        let integerPosition = new Vector2(Math.floor(position.getX()), Math.floor(position.getY()))
        let integerVector = this.getVector(integerPosition);

        let horizontalComponent1, horizontalComponent2, distanceX;
        if (Math.round(position.getX()) < position.getX()) {
            horizontalComponent1 = this.getVector(integerPosition.subtract(Vector2.I_UNIT)).getX();
            horizontalComponent2 = integerVector.getX();
            distanceX = position.getX() - integerPosition.getX() + 0.5;
        } else {
            horizontalComponent1 = integerVector.getX();
            horizontalComponent2 = this.getVector(integerPosition.add(Vector2.I_UNIT)).getX();
            distanceX = position.getX() - integerPosition.getX() - 0.5;
        }
        let horizontalComponent = linearInterpolation(horizontalComponent1, horizontalComponent2, distanceX);

        let verticalComponent1, verticalComponent2, distanceY;
        if (Math.round(position.getY()) < position.getY()) {
            verticalComponent1 = this.getVector(integerPosition.subtract(Vector2.J_UNIT)).getY();
            verticalComponent2 = integerVector.getY();
            distanceY = position.getY() - integerPosition.getY() + 0.5;
        } else {
            verticalComponent1 = integerVector.getY();
            verticalComponent2 = this.getVector(integerPosition.add(Vector2.J_UNIT)).getY();
            distanceY = position.getY() - integerPosition.getY() - 0.5;
        }
        let verticalComponent = linearInterpolation(verticalComponent1, verticalComponent2, distanceY);
        return new Vector2(horizontalComponent, verticalComponent).unit();
    }

    setTarget(target) {
        if (!this.target.equals(target)) {
            this.target = target;
            this.generateHeatMap();
        }
    }

    setMaxDistance(maxDistance) {
        this.maxDistance = maxDistance;
    }

    getTarget() {
        return this.target;
    }

    getMaxDistance() {
        return this.maxDistance;
    }
}