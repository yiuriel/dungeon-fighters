import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { HealthBar } from "../Common/HealthBar";
import { MapGenerator } from "../Map/MapGenerator";

export default class Spider extends Enemy {
  healthBar: HealthBar;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    mapGenerator: MapGenerator,
    frame?: string | number
  ) {
    super(
      scene,
      x,
      y,
      "spider",
      mapGenerator,
      "spider",
      frame,
      50,
      Phaser.Math.Between(30, 45),
      Phaser.Math.Between(5, 15)
    );

    // Set up a smaller collision box at the bottom of the sprite
    if (this.body) {
      this.body.setSize(24, 16);
      this.body.setOffset(4, 16);
    }

    this.healthBar = new HealthBar(
      scene,
      this,
      this.health,
      undefined,
      undefined,
      -15
    );

    this.anims.play(`${this.prefix}_idle`, true);
  }

  protected updateSpecific(): void {
    this.healthBar.update();
    this.healthBar.setHealth(this.health);
  }

  public destroy(): void {
    super.destroy();
    this.healthBar.destroy();
  }
}
