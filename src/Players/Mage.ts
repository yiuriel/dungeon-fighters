import { Player } from "./Player";
import { ManaBar } from "../Common/ManaBar";
import { MageBasicSpell } from "../Spells/MageBasicSpell";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";
import { MageTeleportSpell } from "../Spells/MageTeleportSpell";

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

  private teleportSpellKey: Phaser.Input.Keyboard.Key;
  private teleportSpellCooldown: boolean = false;
  private teleportSpellLifespan: number = 2000;
  private teleportDistance: number = 150;
  private teleportManaCost: number = 35;

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
    super(scene, x, y, texture, "mage", frame, health, speed, skipBars);
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
    this.castSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    ); // For attacking
    this.projectileSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    ); // For projectile spell
    this.teleportSpellKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.C
    ); // For teleport spell

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

    if (this.teleportSpellKey.isDown) {
      this.teleport();
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

  teleport(): void {
    if (this.mana >= this.teleportManaCost && !this.teleportSpellCooldown) {
      let targetX = this.x;
      let targetY = this.y;

      if (this.getFacing() === "up") {
        targetY -= this.teleportDistance;
      } else if (this.getFacing() === "down") {
        targetY += this.teleportDistance;
      } else if (this.getFacing() === "left") {
        targetX -= this.teleportDistance;
      } else if (this.getFacing() === "right") {
        targetX += this.teleportDistance;
      }

      const canTeleport = MageTeleportSpell.canTeleport(
        this.scene,
        this.getFacing(),
        this.teleportDistance,
        targetX,
        targetY
      );

      if (canTeleport) {
        this.mana -= this.teleportManaCost;
        this.manaBar.setMana(this.mana);
        this.teleportSpellCooldown = true;

        const spell = new MageTeleportSpell(
          this.scene,
          this.x,
          this.y,
          "spell",
          this
        );

        spell.startTeleport(this.x, this.y);

        // Fade out player
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 350,
          onComplete: () => {
            // Teleport the player
            this.x = targetX;
            this.y = targetY;

            // End teleport effect at the destination
            spell.endTeleport(this.x, this.y);

            // Fade in player
            this.scene.tweens.add({
              targets: this,
              alpha: 1,
              duration: 350,
            });
          },
        });

        this.scene.time.addEvent({
          delay: this.teleportSpellLifespan,
          callback: () => (this.teleportSpellCooldown = false),
          callbackScope: this,
        });
      }
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
