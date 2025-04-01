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

    this.anims.play(`${this.prefix}_idle`, true);
  }

  protected updateSpecific(): void {}
}
