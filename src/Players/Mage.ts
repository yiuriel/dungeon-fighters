import { Player } from "./Player";
import { ManaBar } from "../Common/ManaBar";
import { MageBasicSpell } from "../Spells/MageBasicSpell";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";
import { MageTeleportSpell } from "../Spells/MageTeleportSpell";
import { MapGenerator } from "../Map/MapGenerator";

export class Mage extends Player {
  private mana: number;
  private maxMana: number = 100;

  // mage specifics
  private castSpellKey: Phaser.Input.Keyboard.Key;
  private castSpellCooldown: boolean = false;
  private castSpellLifespan: number = 1000;
  private castSpellDamage: number = 25;
  private castSpellManaCost: number = 10;

  private projectileSpellKey: Phaser.Input.Keyboard.Key;
  private projectileSpellCooldown: boolean = false;
  private projectileSpellLifespan: number = 750;
  private projectileSpellDamage: number = 40;
  private projectileSpellManaCost: number = 18;
  private projectileSpellLaunchCallback: (spell: MageProjectileSpell) => void =
    () => {};

  private teleportSpellKey: Phaser.Input.Keyboard.Key;
  private teleportSpellCooldown: boolean = false;
  private teleportSpellLifespan: number = 2000;
  private teleportDistance: number = 200;
  private teleportManaCost: number = 25;

  manaRegenTimer: Phaser.Time.TimerEvent;
  manaBar: ManaBar;

  mapGenerator: MapGenerator;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    mapGenerator: MapGenerator,
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
      delay: 3000,
      callback: () => this.regenerateMana(10),
      callbackScope: this,
      loop: true,
    });

    this.mapGenerator = mapGenerator;
  }

  updateSpecific(): void {
    // Check for keyboard input
    if (this.castSpellKey.isDown) {
      this.castSpell();
    }

    if (this.projectileSpellKey.isDown) {
      this.castProjectileSpell();
    }

    if (this.teleportSpellKey.isDown) {
      this.teleport();
    }

    // Check for gamepad input if available
    if (this.gamepad && this.gamepad.connected) {
      // Map gamepad buttons to spells
      // A button (or Cross on PlayStation) - Basic attack
      if (this.gamepad.A || this.gamepad.buttons[0].pressed) {
        this.castSpell();
      }

      // B button (or Circle on PlayStation) - Projectile spell
      if (this.gamepad.B || this.gamepad.buttons[1].pressed) {
        this.castProjectileSpell();
      }

      // X button (or Square on PlayStation) - Teleport spell
      if (this.gamepad.X || this.gamepad.buttons[2].pressed) {
        this.teleport();
      }
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
        this.castSpellDamage * this.damageMultiplier,
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
        this.projectileSpellDamage * this.damageMultiplier,
        this.projectileSpellLifespan,
        135
      );

      // Emit an event when the spell is cast
      // this.scene.events.emit("projectileSpellCast", spell);
      this.projectileSpellLaunchCallback?.(spell);

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

      const canTeleport = MageTeleportSpell.canTeleport(
        this.getFacing(),
        this.teleportDistance,
        targetX,
        targetY,
        this.mapGenerator
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

        // Disable player movement during teleport
        this.canMove = false;

        // Fade out player
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 350,
          onComplete: () => {
            // Teleport the player
            this.x = canTeleport.x;
            this.y = canTeleport.y;

            // End teleport effect at the destination
            spell.endTeleport(this.x, this.y);

            // Fade in player
            this.scene.tweens.add({
              targets: this,
              alpha: 1,
              duration: 350,
              onComplete: () => {
                // Enable player movement after teleport
                this.canMove = true;
              },
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

  getMaxMana(): number {
    return this.maxMana;
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

  attachProjectileSpellCreated(
    callback: (spell: MageProjectileSpell) => void
  ): void {
    this.projectileSpellLaunchCallback = callback;
  }

  destroy(fromScene?: boolean) {
    // Mage-specific cleanup
    this.manaBar.destroy();
    this.manaRegenTimer.destroy();

    super.destroy(fromScene); // This will trigger Player's destroy too
  }
}
