# Screeps Traffic Manager

## Overview
The Screeps Traffic Manager is a utility designed to manage and optimize the movement of creeps in the game Screeps. It uses a modified Ford-Fulkerson method to maximize the number of intended movements called by the `Creep.move()` method.

## Features
1. **Optimized Traffic Management:** Utilizes a modified Ford-Fulkerson method to manage creep traffic efficiently.
2. **Maximized Movements:** Aims to maximize the number of intended movements, ensuring smoother operation of your creeps.
3. **Easy Integration:** Simple to integrate with your existing Screeps codebase.

## Installation
To install the Screeps Traffic Manager, add the necessary files from this repository to your Screeps project.

## Usage
To use the traffic manager in your Screeps code, follow these steps:

1. **Initialization:**
   At the start of your main code (before calling the loop function), initialize the traffic manager:
   ```javascript
   trafficManager.init()
   ```
   
2. **Run Traffic Manager:**
   Use Creep.registerMove(target) instead of Creep.move(direction). target can be direction(1~8), roomPosition or simple coordinates {x,y}
   At the end of your loop code, for every room that you have creeps in, call the traffic manager's run method:
   ```javascript
   for (const roomName in Game.rooms) {
       const room = Game.rooms[roomName];
       trafficManager.run(room);
   }
   ```
   Note: It is essential to call trafficManager.run(room) not only for your own rooms but for every room where your creeps are present. This ensures that the traffic management is applied consistently across all areas where your creeps operate.

3. **Additional features:**
   You can pass PathFinder.PathFinder.CostMatrix and threshold to block certain tiles.

4. **Example:**
   Here's an example of how to integrate the traffic manager with your Screeps main script:
   ```javascript
   // main.js
   const trafficManager = require('trafficManager');
   
   // Initialize the traffic manager
   trafficManager.init();
   
   module.exports.loop = function () {
       // Your existing game logic here
   
       // Run the traffic manager for each room
       for (const roomName in Game.rooms) {
           const room = Game.rooms[roomName];
           trafficManager.run(room);
       }
   }
   ```
   
6. **Contributing:**
   Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request.
