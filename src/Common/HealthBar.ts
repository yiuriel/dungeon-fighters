import Phaser from "phaser";

export class HealthBar {
  bar: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  width: number;
  height: number;
  maxHealth: number;
  currentHealth: number;
  parentSprite: Phaser.GameObjects.Sprite;
  offset: number;

  constructor(
    scene: Phaser.Scene,
    parentSprite: Phaser.GameObjects.Sprite,
    maxHealth: number,
    width: number = 40,
    height: number = 5,
    offset: number = -30
  ) {
    this.parentSprite = parentSprite;
    this.width = width;
    this.height = height;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.offset = offset;

    this.x = parentSprite.x;
    this.y = parentSprite.y + offset;

    this.bar = scene.add.graphics();
    this.bar.setDepth(this.parentSprite.depth + 1);
    this.draw();
  }

  update(): void {
    // Update position to follow the parent sprite
    this.x = this.parentSprite.x;
    this.y = this.parentSprite.y + this.offset;
    this.draw();
  }

  setHealth(health: number): void {
    this.currentHealth = Phaser.Math.Clamp(health, 0, this.maxHealth);
    this.draw();
  }

  draw(): void {
    this.bar.clear();

    // White border
    this.bar.fillStyle(0xffffff, 1);
    this.bar.fillRect(
      this.x - this.width / 2 - 1,
      this.y - 1,
      this.width + 2,
      this.height + 2
    );

    // Background (red)
    this.bar.fillStyle(0xff0000);
    this.bar.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

    // Health (green)
    const healthWidth = Math.floor(
      this.width * (this.currentHealth / this.maxHealth)
    );
    this.bar.fillStyle(0x00ff00);
    this.bar.fillRect(
      this.x - this.width / 2,
      this.y,
      healthWidth,
      this.height
    );

    this.bar.setDepth(this.parentSprite.depth + 1);
  }

  destroy(): void {
    this.bar.destroy();
  }
}
