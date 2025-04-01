import { Player } from "./Player";

export class Mage extends Player {
  private mana: number;
  private spellPower: number;

  // mage specifics
  private castSpellKey: Phaser.Input.Keyboard.Key;
  private castSpellCooldown: boolean = false;

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
    super(scene, x, y, texture, "mage", frame, health, speed, damage);
    this.mana = mana || 100;
    this.spellPower = spellPower || 30;

    if (this.body) {
      this.body.setSize(16, 24);
      this.body.setOffset(4, 8);
    }

    if (!scene.input?.keyboard) {
      throw new Error("Input keyboard not found");
    }
    this.castSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    ); // For attacking
  }

  updateSpecific(): void {
    // Mage specific movement and behavior
    if (this.castSpellKey.isDown) {
      this.castSpell();
    }
  }

  castSpell(): void {
    if (this.mana >= 10 && !this.castSpellCooldown) {
      this.mana -= 10;
      // Implement spell casting logic
      console.log("Spell casted");
      this.castSpellCooldown = true;
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => (this.castSpellCooldown = false),
        callbackScope: this,
      });
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
