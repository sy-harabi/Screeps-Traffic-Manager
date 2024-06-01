/**
 * This version does not ensure optimal solution but more cpu efficient
 */

let movementMap;
let visitedCreeps;

const trafficManager = {
  init(visual = false) {
    Creep.prototype.registerMove = function (target) {
      let targetPosition;

      if (Number.isInteger(target)) {
        const deltaCoords = directionDelta[target];
        targetPosition = {
          x: Math.max(0, Math.min(49, this.pos.x + deltaCoords.x)),
          y: Math.max(0, Math.min(49, this.pos.y + deltaCoords.y)),
        };
      } else {
        targetPosition = target;
      }

      if (visual) {
        new RoomVisual(this.room.name).arrow(this.pos, targetPosition);
      }

      const packedCoord = packCoordinates(targetPosition);
      this._intendedPackedCoord = packedCoord;
    };

    Creep.prototype.setWorkingArea = function (pos, range) {
      this._workingPos = pos;
      this._workingRange = range;
    };
  },

  run(room, costs, threshold) {
    movementMap = new Map();
    const creepsInRoom = room.find(FIND_MY_CREEPS);
    const creepsWithMovementIntent = [];

    for (const creep of creepsInRoom) {
      assignCreepToCoordinate(creep, creep.pos);
      if (creep._intendedPackedCoord) {
        creepsWithMovementIntent.push(creep);
      }
    }

    for (const creep of creepsWithMovementIntent) {
      if (creep._matchedPackedCoord === creep._intendedPackedCoord) {
        continue;
      }

      visitedCreeps = {};

      movementMap.delete(creep._matchedPackedCoord);
      creep._matchedPackedCoord = undefined;

      if (depthFirstSearch(creep, 0, costs, threshold) > 0) {
        continue;
      }

      assignCreepToCoordinate(creep, creep.pos);
    }

    for (const creep of creepsInRoom) {
      const matchedPosition = unpackCoordinates(creep._matchedPackedCoord);

      if (creep.pos.isEqualTo(matchedPosition.x, matchedPosition.y)) {
        continue;
      }

      const direction = creep.pos.getDirectionTo(
        matchedPosition.x,
        matchedPosition.y
      );
      creep.move(direction);
    }
  },
};

function getPossibleMoves(creep, costs, threshold = 255) {
  if (creep._cachedMoveOptions) {
    return creep._cachedMoveOptions;
  }

  const possibleMoves = [creep.pos];

  creep._cachedMoveOptions = possibleMoves;

  if (creep.fatigue > 0) {
    return possibleMoves;
  }

  if (creep._intendedPackedCoord) {
    possibleMoves.unshift(unpackCoordinates(creep._intendedPackedCoord));
    return possibleMoves;
  }

  const adjacentCoords = Object.values(directionDelta).map((delta) => {
    return { x: creep.pos.x + delta.x, y: creep.pos.y + delta.y };
  });

  const roomTerrain = Game.map.getRoomTerrain(creep.room.name);

  const outOfWorkingArea = [];

  for (const adjacentCoord of _.shuffle(adjacentCoords)) {
    if (
      roomTerrain.get(adjacentCoord.x, adjacentCoord.y) === TERRAIN_MASK_WALL
    ) {
      continue;
    }

    if (
      adjacentCoord.x === 0 ||
      adjacentCoord.x === 49 ||
      adjacentCoord.y === 0 ||
      adjacentCoord.y === 49
    ) {
      continue;
    }

    if (costs && costs.get(adjacentCoord.x, adjacentCoord.y) >= threshold) {
      continue;
    }

    if (
      creep._workingPos &&
      creep._workingPos.getRangeTo(adjacentCoord.x, adjacentCoord.y) >
        creep._workingRange
    ) {
      outOfWorkingArea.push(adjacentCoord);
      continue;
    } else {
      possibleMoves.push(adjacentCoord);
    }
  }

  return [..._.shuffle(possibleMoves), ..._.shuffle(outOfWorkingArea)];
}

function depthFirstSearch(creep, currentScore = 0, costs, threshold) {
  visitedCreeps[creep.name] = true;

  const possibleMoves = getPossibleMoves(creep, costs, threshold);

  const emptyTiles = [];

  const occupiedTiles = [];

  for (const coord of possibleMoves) {
    const packedCoord = packCoordinates(coord);
    if (movementMap.get(packedCoord)) {
      occupiedTiles.push(coord);
    } else {
      emptyTiles.push(coord);
    }
  }

  for (const coord of possibleMoves) {
    let score = currentScore;
    const packedCoord = packCoordinates(coord);

    if (creep._intendedPackedCoord === packedCoord) {
      score++;
    }

    const occupyingCreep = movementMap.get(packedCoord);

    if (!occupyingCreep) {
      if (score > 0) {
        assignCreepToCoordinate(creep, coord);
      }
      return score;
    }

    if (!visitedCreeps[occupyingCreep.name]) {
      if (occupyingCreep._intendedPackedCoord === packedCoord) {
        score--;
      }

      const result = depthFirstSearch(occupyingCreep, score, costs, threshold);

      if (result > 0) {
        assignCreepToCoordinate(creep, coord);
        return result;
      }
    }
  }

  return -Infinity;
}

const directionDelta = {
  [TOP]: { x: 0, y: -1 },
  [TOP_RIGHT]: { x: 1, y: -1 },
  [RIGHT]: { x: 1, y: 0 },
  [BOTTOM_RIGHT]: { x: 1, y: 1 },
  [BOTTOM]: { x: 0, y: 1 },
  [BOTTOM_LEFT]: { x: -1, y: 1 },
  [LEFT]: { x: -1, y: 0 },
  [TOP_LEFT]: { x: -1, y: -1 },
};

function assignCreepToCoordinate(creep, coord) {
  const packedCoord = packCoordinates(coord);
  creep._matchedPackedCoord = packedCoord;
  movementMap.set(packedCoord, creep);
}

function packCoordinates(coord) {
  return 50 * coord.y + coord.x;
}

function unpackCoordinates(packedCoord) {
  const x = packedCoord % 50;
  const y = (packedCoord - x) / 50;
  return { x, y };
}

module.exports = trafficManager;
