import { ManaBar } from "../Common/ManaBar";
import { FireMageFireCircle } from "../Spells/FireMageFireCircle";
import { FireMageFireOrb } from "../Spells/FireMageFireOrb";
import { FireMageShield } from "../Spells/FireMageShield";
import { Player } from "./Player";

export class FireMage extends Player {
  private mana: number;
  private maxMana: number = 100;

  // fire mage specifics
  private fireShieldKey: Phaser.Input.Keyboard.Key;
  private fireShieldCooldown: boolean = false;
  private fireShieldLifespan: number = 1000;
  private fireShieldDamage: number = 0;
  private fireShieldManaCost: number = 10;

  private fireCircleKey: Phaser.Input.Keyboard.Key;
  private fireCircleCooldown: boolean = false;
  private fireCircleLifespan: number = 1000;
  private fireCircleDamage: number = 10;
  private fireCircleManaCost: number = 18;

  private fireOrbKey: Phaser.Input.Keyboard.Key;
  private fireOrbCooldown: boolean = false;
  private fireOrbLifespan: number = 2000;
  private fireOrbDamage: number = 10;
  private fireOrbManaCost: number = 25;

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
    mana?: number,
    skipBars?: boolean
  ) {
    super(scene, x, y, texture, "fire_mage", frame, health, speed, skipBars);
    this.mana = mana || 100;

    if (this.body) {
      this.body.setSize(16, 24);
      this.body.setOffset(4, 8);
    }

    this.manaBar = new ManaBar(scene, this, this.mana);
    if (skipBars) {
      this.manaBar.destroy();
    }

    if (!scene.input?.keyboard) {
      throw new Error("Input keyboard not found");
    }
    this.fireShieldKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    ); // For fire shield
    this.fireCircleKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    ); // For fire circle
    this.fireOrbKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.C
    ); // For fire orb

    // Set up mana regeneration timer
    this.manaRegenTimer = scene.time.addEvent({
      delay: 3000,
      callback: () => this.regenerateMana(10),
      callbackScope: this,
      loop: true,
    });
  }

  updateSpecific(): void {
    // Check for keyboard input
    if (this.fireShieldKey.isDown) {
      this.castFireShield();
    }

    if (this.fireCircleKey.isDown) {
      this.castFireCircle();
    }

    if (this.fireOrbKey.isDown) {
      this.castFireOrb();
    }

    // Check for gamepad input if available
    if (this.gamepad && this.gamepad.connected) {
      // Map gamepad buttons to spells
      // A button (or Cross on PlayStation) - Fire Shield
      if (this.gamepad.A || this.gamepad.buttons[0].pressed) {
        this.castFireShield();
      }

      // B button (or Circle on PlayStation) - Fire Circle
      if (this.gamepad.B || this.gamepad.buttons[1].pressed) {
        this.castFireCircle();
      }

      // X button (or Square on PlayStation) - Fire Orb
      if (this.gamepad.X || this.gamepad.buttons[2].pressed) {
        this.castFireOrb();
      }
    }

    this.manaBar.update();
    this.healthBar.update();
  }

  castFireShield(): void {
    if (this.mana >= this.fireShieldManaCost && !this.fireShieldCooldown) {
      this.fireShieldCooldown = true;
      this.mana -= this.fireShieldManaCost;
      this.manaBar.setMana(this.mana);
      new FireMageShield(
        this.scene,
        this.x,
        this.y,
        this,
        this.fireShieldLifespan
      );

      this.scene.time.delayedCall(this.fireShieldLifespan + 2000, () => {
        this.fireShieldCooldown = false;
      });
    }
  }

  castFireCircle(): void {
    if (this.mana >= this.fireCircleManaCost && !this.fireCircleCooldown) {
      this.mana -= this.fireCircleManaCost;
      this.manaBar.setMana(this.mana);
      const fireCircle = new FireMageFireCircle(
        this.scene,
        this.x,
        this.y,
        this
      );
      fireCircle.damage = this.fireCircleDamage * this.damageMultiplier;
      this.scene.events.emit("fireCircleCreated", fireCircle);

      this.fireCircleCooldown = true;
      this.scene.time.delayedCall(this.fireCircleLifespan, () => {
        this.fireCircleCooldown = false;
      });
    }
  }

  castFireOrb(): void {
    if (this.mana >= this.fireOrbManaCost && !this.fireOrbCooldown) {
      this.mana -= this.fireOrbManaCost;
      this.manaBar.setMana(this.mana);
      const fireOrb = new FireMageFireOrb(
        this.scene,
        this.x,
        this.y,
        "fire_mage_orb",
        this,
        this.fireOrbDamage * this.damageMultiplier,
        this.fireOrbLifespan
      );

      this.scene.events.emit("fireOrbCreated", fireOrb);

      this.fireOrbCooldown = true;
      this.scene.time.delayedCall(this.fireOrbLifespan, () => {
        this.fireOrbCooldown = false;
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

  getMaxMana(): number {
    return this.maxMana;
  }

  getFireShieldCooldown(): boolean {
    return this.fireShieldCooldown;
  }

  getFireShieldDamage(): number {
    return this.fireShieldDamage;
  }

  getFireShieldLifespan(): number {
    return this.fireShieldLifespan;
  }

  getFireCircleDamage(): number {
    return this.fireCircleDamage;
  }

  getFireCircleLifespan(): number {
    return this.fireCircleLifespan;
  }

  destroy(fromScene?: boolean) {
    // FireMage-specific cleanup
    this.manaBar.destroy();
    this.manaRegenTimer.destroy();

    super.destroy(fromScene); // This will trigger Player's destroy too
  }
}
