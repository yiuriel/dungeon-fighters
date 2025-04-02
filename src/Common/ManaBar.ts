import Phaser from "phaser";
import { HealthBar } from "./HealthBar";

export class ManaBar extends HealthBar {
  constructor(
    scene: Phaser.Scene,
    parentSprite: Phaser.GameObjects.Sprite,
    maxMana: number,
    width: number = 40,
    height: number = 5,
    offset: number = -40
  ) {
    super(scene, parentSprite, maxMana, width, height, offset);
  }

  setMana(mana: number): void {
    this.currentHealth = mana;
    this.draw();
  }

  draw(): void {
    this.bar.clear();

    // Draw background (empty bar)
    this.bar.fillStyle(0x222222, 0.8);
    this.bar.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

    // Calculate mana ratio
    const manaRatio = this.currentHealth / this.maxHealth;
    // White border with skew effect
    this.bar.fillStyle(0xffffff, 1);
    this.bar.fillRect(
      this.x - this.width / 2 - 1,
      this.y - 1,
      this.width + 2,
      this.height + 2
    );

    // Main mana bar (dodger blue)
    this.bar.fillStyle(0x1e90ff, 1);

    // Apply slight skew effect
    this.bar.fillRect(
      this.x - this.width / 2,
      this.y,
      this.width * manaRatio,
      this.height
    );
  }
}
