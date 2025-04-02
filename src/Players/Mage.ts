import { Player } from "./Player";
import { ManaBar } from "../Common/ManaBar";
import { MageBasicSpell } from "../Spells/MageBasicSpell";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";

export class Mage extends Player {
  private mana: number;

  // mage specifics
  private castSpellKey: Phaser.Input.Keyboard.Key;
  private castSpellCooldown: boolean = false;
  private castSpellLifespan: number = 1000;
  private castSpellDamage: number = 20;
  private castSpellManaCost: number = 10;

  private projectileSpellKey: Phaser.Input.Keyboard.Key;
  private projectileSpellCooldown: boolean = false;
  private projectileSpellLifespan: number = 1000;
  private projectileSpellDamage: number = 30;
  private projectileSpellManaCost: number = 25;

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
    mana?: number
  ) {
    super(scene, x, y, texture, "mage", frame, health, speed, damage);
    this.mana = mana || 100;

    if (this.body) {
      this.body.setSize(16, 24);
      this.body.setOffset(4, 8);
    }

    this.manaBar = new ManaBar(scene, this, this.mana);

    if (!scene.input?.keyboard) {
      throw new Error("Input keyboard not found");
    }
    this.castSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    ); // For attacking
    this.projectileSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    ); // For projectile spell

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

    if (this.projectileSpellKey.isDown) {
      this.castProjectileSpell();
    }

    this.manaBar.update();
    this.healthBar.update();
  }

  castSpell(): void {
    if (this.mana >= this.castSpellManaCost && !this.castSpellCooldown) {
      this.mana -= this.castSpellManaCost;
      // Implement spell casting logic
      this.manaBar.setMana(this.mana);
      this.castSpellCooldown = true;
      const spell = new MageBasicSpell(
        this.scene,
        this.x,
        this.y,
        "spell",
        this,
        this.castSpellDamage,
        this.castSpellLifespan
      );

      // Emit an event when the spell is cast
      this.scene.events.emit("spellCast", spell);

      this.scene.time.addEvent({
        delay: this.castSpellLifespan + 250,
        callback: () => (this.castSpellCooldown = false),
        callbackScope: this,
      });
    }
  }

  castProjectileSpell(): void {
    if (
      this.mana >= this.projectileSpellManaCost &&
      !this.projectileSpellCooldown
    ) {
      this.mana -= this.projectileSpellManaCost;
      // Implement spell casting logic
      this.manaBar.setMana(this.mana);
      this.projectileSpellCooldown = true;
      const spell = new MageProjectileSpell(
        this.scene,
        this.x,
        this.y,
        "spell",
        this,
        this.projectileSpellDamage,
        this.projectileSpellLifespan
      );

      // Emit an event when the spell is cast
      this.scene.events.emit("projectileSpellCast", spell);

      this.scene.time.addEvent({
        delay: this.projectileSpellLifespan + 250,
        callback: () => (this.projectileSpellCooldown = false),
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

  getCastSpellDamage(): number {
    return this.castSpellDamage;
  }

  getCastSpellLifespan(): number {
    return this.castSpellLifespan;
  }

  getProjectileSpellDamage(): number {
    return this.projectileSpellDamage;
  }

  getProjectileSpellLifespan(): number {
    return this.projectileSpellLifespan;
  }
}
