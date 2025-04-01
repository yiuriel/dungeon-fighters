import Phaser from "phaser";
import { Enemy } from "./Enemy";

export default class Spider extends Enemy {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame?: string | number
  ) {
    super(scene, x, y, "spider", "spider", frame, 50, 30, 5);

    // Set up a smaller collision box at the bottom of the sprite
    if (this.body) {
      this.body.setSize(24, 16);
      this.body.setOffset(4, 16);
    }

    this.anims.play(`${this.prefix}_idle`, true);
  }

  protected updateSpecific(): void {}
}
