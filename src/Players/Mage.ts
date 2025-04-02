import { Player } from "./Player";
import { ManaBar } from "../Common/ManaBar";
import { MageBasicSpell } from "../Spells/MageBasicSpell";

export class Mage extends Player {
  private mana: number;
  private spellPower: number;

  // mage specifics
  private castSpellKey: Phaser.Input.Keyboard.Key;
  private castSpellCooldown: boolean = false;
  manaRegenTimer: Phaser.Time.TimerEvent;

  manaBar: ManaBar;

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

    this.manaBar = new ManaBar(scene, this, this.mana);

    if (!scene.input?.keyboard) {
      throw new Error("Input keyboard not found");
    }
    this.castSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    ); // For attacking

    // Set up mana regeneration timer
    this.manaRegenTimer = scene.time.addEvent({
      delay: 5000,
      callback: () => this.regenerateMana(10),
      callbackScope: this,
      loop: true,
    });
  }

  updateSpecific(): void {
    // Mage specific movement and behavior
    if (this.castSpellKey.isDown) {
      this.castSpell();
    }

    this.manaBar.update();
    this.healthBar.update();
  }

  castSpell(): void {
    if (this.mana >= 10 && !this.castSpellCooldown) {
      this.mana -= 10;
      // Implement spell casting logic
      this.manaBar.setMana(this.mana);
      this.castSpellCooldown = true;
      const spell = new MageBasicSpell(
        this.scene,
        this.x,
        this.y,
        "spell",
        this
      );

      // Emit an event when the spell is cast
      this.scene.events.emit("spellCast", spell);

      this.scene.time.addEvent({
        delay: 1000,
        callback: () => (this.castSpellCooldown = false),
        callbackScope: this,
      });
    }
  }

  regenerateMana(amount: number): void {
    this.mana = Math.min(this.mana + amount, 100);
    this.manaBar.setMana(this.mana);
  }

  getMana(): number {
    return this.mana;
  }

  getSpellPower(): number {
    return this.spellPower;
  }
}
