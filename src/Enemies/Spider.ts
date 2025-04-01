import Phaser from "phaser";
import { Enemy } from "./Enemy";

export default class Spider extends Enemy {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame?: string | number
  ) {
    super(scene, x, y, "spider", frame, 50, 80, 5);

    this.anims.create({
      key: "spider_idle",
      frames: this.anims.generateFrameNumbers("spider", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update(): void {
    if (!this.active) return;

    this.anims.play("spider_idle");
    // Spider specific movement or behavior
  }
}
