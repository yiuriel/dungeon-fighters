import { Player } from "./Player";

export class Mage extends Player {
  private mana: number;
  private spellPower: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    health?: number,
    speed?: number,
    damage?: number,
    mana?: number,
    spellPower?: number
  ) {
    super(scene, x, y, texture, frame, health, speed, damage);
    this.mana = mana || 100;
    this.spellPower = spellPower || 30;
  }

  update(): void {
    // Mage specific movement and behavior
    const cursors = this.scene.input?.keyboard?.createCursorKeys();

    if (!cursors) return;

    // Reset velocity
    this.setVelocity(0);

    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-this.speed);
    } else if (cursors.down.isDown) {
      this.setVelocityY(this.speed);
    }
  }

  castSpell(): void {
    if (this.mana >= 10) {
      this.mana -= 10;
      // Implement spell casting logic
    }
  }

  regenerateMana(amount: number): void {
    this.mana = Math.min(this.mana + amount, 100);
  }

  getMana(): number {
    return this.mana;
  }

  getSpellPower(): number {
    return this.spellPower;
  }
}
