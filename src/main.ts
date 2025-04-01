import Phaser from "phaser";
import StartScreenScene from "./Scenes/StartScreenScene";
import AssetPreloadScene from "./Scenes/AssetPreloadScene";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants";
import LevelScene from "./Scenes/LevelScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  scene: [AssetPreloadScene, StartScreenScene, LevelScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: true,
    },
  },
  pixelArt: true,
};

new Phaser.Game(config);
