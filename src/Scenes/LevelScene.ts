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

export default class LevelScene extends Phaser.Scene {
  private players!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private overlapSpells!: Phaser.Physics.Arcade.Group;
  private collideSpells!: Phaser.Physics.Arcade.Group;
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
    this.children.removeAll();
    this.physics.world.colliders.destroy();

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
    }
    this.players.add(player);
    this.player = player;

    // Create enemies group
    this.enemies = this.physics.add.group();

    // Create spells group
    this.overlapSpells = this.physics.add.group();
    this.collideSpells = this.physics.add.group();

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

    this.events.on("projectileSpellCast", (spell: any) => {
      this.collideSpells.add(spell);
    });

    this.events.on("fireCircleCreated", (fireCircle: any) => {
      this.overlapSpells.add(fireCircle);
    });

    // Create some enemies
    for (let i = 0; i < this.currentLevel * 2; i++) {
      const { x, y } = this.mapGenerator.getRandomNonRoomPosition();
      const spider = new Spider(this, x, y, this.mapGenerator);
      this.enemies.add(spider);
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
      this.mapGenerator.getBoundaries()
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
  }

  private handleProjectileSpellEnemyCollision(
    projectileSpell: any,
    enemy: any
  ) {
    if (
      projectileSpell instanceof MageProjectileSpell &&
      enemy instanceof Enemy
    ) {
      // Only do damage if spell is still in active animation frame
      if (
        projectileSpell.anims.currentAnim?.key ===
          projectileSpell.getStartAnimationKey() ||
        projectileSpell.anims.currentAnim?.key ===
          projectileSpell.getIdleAnimationKey()
      ) {
        enemy.takeDamage(projectileSpell.getDamage());
      }
    }
  }
}
