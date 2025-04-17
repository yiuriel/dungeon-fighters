import Phaser from "phaser";
import { Status } from "../Common/Status";
import { Enemy } from "../Enemies/Enemy";
import Spider from "../Enemies/Spider";
import { MapGenerator } from "../Map/MapGenerator";
import { FireMage } from "../Players/FireMage";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";
import { FireMageFireCircle } from "../Spells/FireMageFireCircle";
import { MageBasicSpell } from "../Spells/MageBasicSpell";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";
import Octopus from "../Enemies/Octopus";
import Snake from "../Enemies/Snake";
import { SnakeVenomProjectile } from "../Spells/SnakeVenomProjectile";
import { HealthPotion } from "../Items/HealthPotion";
import { ManaPotion } from "../Items/ManaPotion";
import { Item } from "../Items/Item";
import { HealthManaPotion } from "../Items/HealthManaPotion";
import { Scepter } from "../Items/Scepter";
import { FireMageFireOrb } from "../Spells/FireMageFireOrb";

export default class LevelScene extends Phaser.Scene {
  private players!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private overlapSpells!: Phaser.Physics.Arcade.Group;
  private collideSpells!: Phaser.Physics.Arcade.Group;
  private healthPotions!: Phaser.Physics.Arcade.Group;
  private manaPotions!: Phaser.Physics.Arcade.Group;
  private healthManaPotions!: Phaser.Physics.Arcade.Group;
  private scepters!: Phaser.Physics.Arcade.Group;
  private mapGenerator: MapGenerator;
  private player!: Player;
  private currentLevel: number = 1;
  private levelTransitionCooldown: boolean = false;

  constructor() {
    super("LevelScene");

    this.mapGenerator = new MapGenerator(this);
  }

  preload() {
    this.mapGenerator.preload();
  }

  prepareLevel() {
    this.mapGenerator.resetMap();

    // Clear existing content
    // this.children.removeAll();
    this.physics.world.colliders.destroy();

    this.physics.world.drawDebug = true;

    // Create a simple bounded area with walls
    this.mapGenerator.generateMap();

    if (this.players) {
      this.players.clear(true, true);
    }

    if (this.enemies) {
      this.enemies.clear(true, true);
    }

    if (this.overlapSpells) {
      this.overlapSpells.clear(true, true);
    }

    if (this.collideSpells) {
      this.collideSpells.clear(true, true);
    }

    if (this.healthPotions) {
      this.healthPotions.clear(true, true);
    }

    if (this.manaPotions) {
      this.manaPotions.clear(true, true);
    }

    if (this.healthManaPotions) {
      this.healthManaPotions.clear(true, true);
    }

    if (this.scepters) {
      this.scepters.clear(true, true);
    }

    // Create players group
    this.players = this.physics.add.group();

    // Create player in the center
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    let player: Player;
    const { x, y } = this.mapGenerator.getRandomNonRoomPosition();
    if (selectedCharacter === "fire_mage") {
      player = new FireMage(this, x, y, "player");
    } else {
      player = new Mage(this, x, y, "player", this.mapGenerator);
      (player as Mage).attachProjectileSpellCreated(
        (spell: MageProjectileSpell) => {
          this.collideSpells.add(spell);
        }
      );
    }
    this.players.add(player);
    this.player = player;

    // Create enemies group
    this.enemies = this.physics.add.group();

    // Create spells group
    this.overlapSpells = this.physics.add.group();
    this.collideSpells = this.physics.add.group();

    // Create potions group
    this.healthPotions = this.physics.add.group();
    this.manaPotions = this.physics.add.group();
    this.healthManaPotions = this.physics.add.group();

    // Scale potion counts with level (min 1, max 6)
    const baseCount = 2;
    const maxCount = 8;
    const levelFactor = Math.min(1, this.currentLevel / 10); // Scales up to level 10

    // Add health potions randomly in the map
    const potionCount = Math.min(
      maxCount,
      baseCount + Math.floor(levelFactor * 5)
    );
    for (let i = 0; i < potionCount; i++) {
      const potionPos = this.mapGenerator.getRandomNonRoomPosition();
      const potion = new HealthPotion(this, potionPos.x, potionPos.y);
      this.healthPotions.add(potion);
    }

    // Add mana potions randomly in the map
    const manaPotionCount = Math.min(
      maxCount,
      baseCount + Math.floor(levelFactor * 5)
    );
    for (let i = 0; i < manaPotionCount; i++) {
      const potionPos = this.mapGenerator.getRandomNonRoomPosition();
      const potion = new ManaPotion(this, potionPos.x, potionPos.y);
      this.manaPotions.add(potion);
    }

    // Add health-mana potions randomly in the map
    const healthManaPotionCount = Math.min(
      maxCount,
      baseCount + Math.floor(levelFactor * 3)
    );
    for (let i = 0; i < healthManaPotionCount; i++) {
      const potionPos = this.mapGenerator.getRandomNonRoomPosition();
      const potion = new HealthManaPotion(this, potionPos.x, potionPos.y);
      this.healthManaPotions.add(potion);
    }

    // Create scepters group
    this.scepters = this.physics.add.group();

    // Add scepters randomly in the map (scales with level)
    const scepterCount = Math.min(3, baseCount + Math.floor(levelFactor * 2));
    for (let i = 0; i < scepterCount; i++) {
      const scepterPos = this.mapGenerator.getRandomNonRoomPosition();
      const scepter = new Scepter(this, scepterPos.x, scepterPos.y);
      this.scepters.add(scepter);
    }

    // Set up camera to follow the player
    this.physics.world.setBounds(
      0,
      0,
      this.mapGenerator.getMapRealWidth(),
      this.mapGenerator.getMapRealHeight()
    );
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
    this.cameras.main.setBounds(
      0,
      0,
      this.mapGenerator.getMapRealWidth(),
      this.mapGenerator.getMapRealHeight()
    );

    // Listen for spell cast events
    this.events.on("spellCast", (spell: any) => {
      this.overlapSpells.add(spell);
    });

    this.events.on("venomSpellFired", (venomSpell: any) => {
      this.collideSpells.add(venomSpell);
    });

    this.events.on("fireCircleCreated", (fireCircle: any) => {
      this.overlapSpells.add(fireCircle);
    });

    this.events.on("fireOrbCreated", (fireOrb: any) => {
      this.overlapSpells.add(fireOrb);
    });

    // Create some enemies
    for (let i = 0; i < this.currentLevel * 2; i++) {
      const { x, y } = this.mapGenerator.getRandomNonRoomPosition();
      const enemyType = Phaser.Math.Between(0, 2);
      if (enemyType === 0) {
        const spider = new Spider(this, x, y, this.mapGenerator);
        this.enemies.add(spider);
      } else if (enemyType === 1) {
        const octopus = new Octopus(this, x, y, this.mapGenerator);
        this.enemies.add(octopus);
      } else {
        const snake = new Snake(this, x, y, this.mapGenerator);
        this.enemies.add(snake);
      }
    }

    // Set up collisions
    this.physics.add.collider(this.players, this.mapGenerator.getBoundaries());
    this.physics.add.collider(this.enemies, this.mapGenerator.getBoundaries());
    this.physics.add.collider(
      this.overlapSpells,
      this.mapGenerator.getBoundaries()
    );
    this.physics.add.collider(
      this.collideSpells,
      this.mapGenerator.getBoundaries(),
      this.handleSpellWallCollision,
      undefined,
      this
    );

    this.physics.add.collider(
      this.enemies,
      this.enemies,
      this.handleEnemyEnemyCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.players,
      this.enemies,
      this.handlePlayerEnemyCollision,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.overlapSpells,
      this.enemies,
      this.handleSpellEnemyCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.collideSpells,
      this.enemies,
      this.handleProjectileSpellEnemyCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.players,
      this.collideSpells,
      this.handleEnemySpellPlayerCollision,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.healthPotions,
      this.players,
      this.handlePotionPickup,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.manaPotions,
      this.players,
      this.handlePotionPickup,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.healthManaPotions,
      this.players,
      this.handlePotionPickup,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.scepters,
      this.players,
      this.handleScepterPickup,
      undefined,
      this
    );
    // Create level indicator
    this.add
      .text(16, 16, `Level: ${this.currentLevel}`, {
        fontSize: "26px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  create() {
    this.prepareLevel();
  }

  update() {
    // Check if all enemies are defeated
    if (
      this.enemies &&
      this.enemies.getChildren().length === 0 &&
      !this.levelTransitionCooldown
    ) {
      this.levelTransitionCooldown = true;
      // Increase level
      this.currentLevel++;

      this.time.delayedCall(1000, () => {
        this.prepareLevel();
        this.levelTransitionCooldown = false;
      });
    }

    // Update players
    this.players.getChildren().forEach((player) => {
      if (player instanceof Player) {
        player.update();
      }
    });

    // Update enemies
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy instanceof Enemy) {
        enemy.update();
      }
    });
  }

  private handlePlayerEnemyCollision(player: any, enemy: any) {
    if (player instanceof Player && enemy instanceof Enemy) {
      if (player instanceof FireMage && player.getFireShieldCooldown()) {
        return;
      } else {
        player.takeDamage(enemy.doDamage());
      }
    }
  }

  private handleEnemyEnemyCollision(enemy1: any, enemy2: any) {
    if (enemy1 instanceof Enemy && enemy2 instanceof Enemy) {
      enemy1.knockback(enemy2);
    }
  }

  private handleSpellEnemyCollision(spell: any, enemy: any) {
    if (spell instanceof MageBasicSpell && enemy instanceof Enemy) {
      // Only do damage if spell is still in active animation frame
      if (spell.anims.currentAnim?.key === spell.getStartAnimationKey()) {
        enemy.takeDamage(spell.getDamage());
      }
    }

    if (spell instanceof FireMageFireCircle && enemy instanceof Enemy) {
      // Only do damage if spell is still in active animation frame
      if (spell.anims.currentAnim?.key === spell.getActiveAnimationKey()) {
        enemy.takeDamage(
          spell.getDamage(),
          new Status(
            this,
            enemy,
            "fire",
            5,
            5000,
            enemy.getTakingDamageDuration(),
            () => {
              enemy.onStatusFinished();
            }
          )
        );
      }
    }

    if (spell instanceof FireMageFireOrb && enemy instanceof Enemy) {
      // Only do damage if spell is still in active animation frame
      if (
        spell.anims.currentAnim?.key === spell.getIdleAnimationKey() ||
        spell.anims.currentAnim?.key === spell.getStartAnimationKey()
      ) {
        enemy.takeDamage(
          spell.getDamage(),
          new Status(
            this,
            enemy,
            "fire",
            5,
            8000,
            enemy.getTakingDamageDuration(),
            () => {
              enemy.onStatusFinished();
            }
          )
        );
      }
    }
  }

  private handleProjectileSpellEnemyCollision(
    projectileSpell: any,
    enemy: any
  ) {
    if (
      projectileSpell instanceof MageProjectileSpell &&
      enemy instanceof Enemy
    ) {
      enemy.takeDamage(projectileSpell.getDamage());
      projectileSpell.destroy(true);
    }
  }

  private handleEnemySpellPlayerCollision(player: any, spell: any) {
    if (player instanceof Player && spell instanceof SnakeVenomProjectile) {
      // Only do damage if spell is still in active animation frame
      if (
        spell.anims.currentAnim?.key === spell.getStartAnimationKey() ||
        spell.anims.currentAnim?.key === spell.getIdleAnimationKey()
      ) {
        player.takeDamage(
          spell.getDamage(),
          new Status(this, player, "venom", 5, 2000, 1000, () => {
            player.onStatusFinished();
          })
        );
        spell.destroy(true);
      }
    }
  }

  private handleSpellWallCollision(spell: any, _: any) {
    spell.destroy(true);
  }

  private handlePotionPickup(potion: any, player: any) {
    if (
      potion instanceof Item &&
      player instanceof Player &&
      potion.canUse(player)
    ) {
      potion.use(player);
    }
  }

  private handleScepterPickup(scepter: any, player: any) {
    if (
      scepter instanceof Scepter &&
      player instanceof Player &&
      scepter.canUse(player)
    ) {
      scepter.use(player);
    }
  }
}
