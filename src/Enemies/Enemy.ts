export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected health: number;
  protected speed: number;
  protected damage: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    health?: number,
    speed?: number,
    damage?: number
  ) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = health || 100;
    this.speed = speed || 100;
    this.damage = damage || 10;
  }

  abstract update(): void;

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  public getDamage(): number {
    return this.damage;
  }
}
