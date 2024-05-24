let matching;
let visited;

const trafficManager = {
  init() {
    if (!Creep.prototype._move) {
      Creep.prototype._move = Creep.prototype.move;
    }

    Creep.prototype.move = function (target) {
      let intendedCoord;

      if (Number.isInteger(target)) {
        const coordDelta = delta[target];
        intendedCoord = {
          x: Math.max(0, Math.min(49, this.pos.x + coordDelta.x)),
          y: Math.max(0, Math.min(49, this.pos.y + coordDelta.y)),
        };
      } else {
        intendedCoord = target;
      }

      const packed = packCoord(intendedCoord);

      this._intendedPacked = packed;
    };
  },

  run(room) {
    matching = new Map();

    const creeps = room.find(FIND_MY_CREEPS);

    const creepsWithMoveIntent = [];

    for (const creep of creeps) {
      match(creep, creep.pos);
      if (creep._intendedPacked) {
        creepsWithMoveIntent.push(creep);
      }
    }

    for (const creep of creepsWithMoveIntent) {
      if (creep._matchedPacked === creep._intendedPacked) {
        continue;
      }

      visited = {};

      matching.delete(creep._matchedPacked);

      creep._matchedPacked = undefined;

      if (dfs(creep) > 0 > 0) {
        continue;
      }

      match(creep, creep.pos);
    }

    for (const creep of creeps) {
      const matchedCoord = unpackCoord(creep._matchedPacked);

      if (creep.pos.isEqualTo(matchedCoord.x, matchedCoord.y)) {
        continue;
      }

      const direction = creep.pos.getDirectionTo(
        matchedCoord.x,
        matchedCoord.y
      );

      creep._move(direction);
    }
  },
};

function getMoveCandidates(creep) {
  if (creep._moveCandidates) {
    return creep._moveCandidates;
  }

  const result = [creep.pos];

  if (creep.fatigue > 0) {
    return result;
  }

  creep._moveCandidates = result;

  if (creep._intendedPacked) {
    result.unshift(unpackCoord(creep._intendedPacked));
    return result;
  }

  const adjacents = Object.values(delta).map((obj) => {
    return { x: creep.pos.x + obj.x, y: creep.pos.y + obj.y };
  });

  const terrain = Game.map.getRoomTerrain(creep.room.name);

  for (const adjacent of adjacents) {
    if (terrain.get(adjacent.x, adjacent.y) === TERRAIN_MASK_WALL) {
      continue;
    }
    if (
      adjacent.x === 0 ||
      adjacent.x === 49 ||
      adjacent.y === 0 ||
      adjacent.y === 49
    ) {
      continue;
    }
    result.push(adjacent);
  }

  return result;
}

function dfs(creep, score = 0) {
  visited[creep.name] = true;

  for (const coord of getMoveCandidates(creep)) {
    let currentScore = score;

    const packed = packCoord(coord);

    if (creep._intendedPacked === packed) {
      currentScore++;
    }

    const occupyingCreep = matching.get(packed);

    if (!occupyingCreep) {
      if (currentScore > 0) {
        match(creep, coord);
      }
      return currentScore;
    }

    if (!visited[occupyingCreep.name]) {
      if (occupyingCreep._intendedPacked === packed) {
        currentScore--;
      }

      const result = dfs(occupyingCreep, currentScore);

      if (result > 0) {
        match(creep, coord);
        return result;
      }
    }
  }

  return -Infinity;
}

const delta = {
  [TOP]: { x: 0, y: -1 },
  [TOP_RIGHT]: { x: 1, y: -1 },
  [RIGHT]: { x: 1, y: 0 },
  [BOTTOM_RIGHT]: { x: 1, y: 1 },
  [BOTTOM]: { x: 0, y: 1 },
  [BOTTOM_LEFT]: { x: -1, y: 1 },
  [LEFT]: { x: -1, y: 0 },
  [TOP_LEFT]: { x: -1, y: -1 },
};

function match(creep, coord) {
  const packed = packCoord(coord);

  creep._matchedPacked = packed;
  matching.set(packed, creep);
}

function packCoord(coord) {
  return 50 * coord.y + coord.x;
}

function unpackCoord(packed) {
  const x = packed % 50;
  const y = (packed - x) / 50;
  return { x, y };
}

module.exports = trafficManager;
