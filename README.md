# Screeps Traffic Manager

## Overview
The Screeps Traffic Manager is a utility designed to manage and optimize the movement of creeps in the game Screeps. It uses a modified Ford-Fulkerson method to maximize the number of intended movements called by the `Creep.move()` method.

## Features
1. **Optimized Traffic Management:** Utilizes a modified Ford-Fulkerson method to manage creep traffic efficiently.
2. **Maximized Movements:** Aims to maximize the number of intended movements, ensuring smoother operation of your creeps.
3. **Easy Integration:** Simple to integrate with your existing Screeps codebase.
4. **Not Fully Tested:** Note that this project is still in the testing phase and may cause unexpected issues.

## Installation
To install the Screeps Traffic Manager, add the necessary files from this repository to your Screeps project.

## Usage
To use the traffic manager in your Screeps code, follow these steps:

1. **Initialization:**
   At the start of your main code (before calling the loop function), initialize the traffic manager:
   ```javascript
   trafficManager.init()

   At the end of your loop code, for every room in Game.rooms, call the traffic manager's run method:
   ```javascript
   for (const roomName in Game.rooms) {
       const room = Game.rooms[roomName];
       trafficManager.run(room);
   }
