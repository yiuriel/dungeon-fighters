import Phaser from "phaser";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "./constants";
import AssetPreloadScene from "./Scenes/AssetPreloadScene";
import LevelScene from "./Scenes/LevelScene";
import StartScreenScene from "./Scenes/StartScreenScene";

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
      debugShowBody: true,
      debugShowVelocity: true,
      debugBodyColor: 0x00ffff, // cyan, por ejemplo
    },
  },
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  render: {
    pixelArt: true,
    roundPixels: true,
  },
};

new Phaser.Game(config);
