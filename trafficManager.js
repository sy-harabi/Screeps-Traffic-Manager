let movementMap;
let visitedCreeps;

const trafficManager = {
  init() {
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

      const packedCoord = packCoordinates(targetPosition);
      this._intendedPackedCoord = packedCoord;
    };
  },

  run(room) {
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

      if (depthFirstSearch(creep) > 0) {
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

function getPossibleMoves(creep) {
  if (creep._cachedMoveOptions) {
    return creep._cachedMoveOptions;
  }

  const possibleMoves = [creep.pos];

  if (creep.fatigue > 0) {
    return possibleMoves;
  }

  creep._cachedMoveOptions = possibleMoves;

  if (creep._intendedPackedCoord) {
    possibleMoves.unshift(unpackCoordinates(creep._intendedPackedCoord));
    return possibleMoves;
  }

  const adjacentPositions = Object.values(directionDelta).map((delta) => {
    return { x: creep.pos.x + delta.x, y: creep.pos.y + delta.y };
  });

  const roomTerrain = Game.map.getRoomTerrain(creep.room.name);

  for (const adjacentPos of adjacentPositions) {
    if (roomTerrain.get(adjacentPos.x, adjacentPos.y) === TERRAIN_MASK_WALL) {
      continue;
    }
    if (
      adjacentPos.x === 0 ||
      adjacentPos.x === 49 ||
      adjacentPos.y === 0 ||
      adjacentPos.y === 49
    ) {
      continue;
    }
    possibleMoves.push(adjacentPos);
  }

  return possibleMoves;
}

function depthFirstSearch(creep, currentScore = 0) {
  visitedCreeps[creep.name] = true;

  for (const coord of getPossibleMoves(creep)) {
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

      const result = depthFirstSearch(occupyingCreep, score);

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
