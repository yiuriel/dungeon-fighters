import Phaser from "phaser";
import { WINDOW_CENTER } from "../constants";
import { Enemy } from "../Enemies/Enemy";
import Spider from "../Enemies/Spider";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";
import { MageBasicSpell } from "../Spells/MageBasicSpell";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";

export default class LevelScene extends Phaser.Scene {
  private players!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private overlapSpells!: Phaser.Physics.Arcade.Group;
  private collideSpells!: Phaser.Physics.Arcade.Group;

  constructor() {
    super("LevelScene");
  }

  create() {
    // Create a simple bounded area with walls
    this.walls = this.physics.add.staticGroup();

    // Create boundary walls (top, right, bottom, left)
    const mapWidth = this.cameras.main.width;
    const mapHeight = this.cameras.main.height;
    const wallThickness = 20;

    // Top wall - positioned exactly at the edge
    // Top wall
    this.walls
      .create(mapWidth / 2, wallThickness / 2, "tiles")
      .setScale(mapWidth / 32, wallThickness / 32)
      .refreshBody();

    // Bottom wall
    this.walls
      .create(mapWidth / 2, mapHeight - wallThickness / 2, "tiles")
      .setScale(mapWidth / 32, wallThickness / 32)
      .refreshBody();

    // Left wall
    this.walls
      .create(wallThickness / 2, mapHeight / 2, "tiles")
      .setScale(wallThickness / 32, mapHeight / 32)
      .refreshBody();

    // Right wall
    this.walls
      .create(mapWidth - wallThickness / 2, mapHeight / 2, "tiles")
      .setScale(wallThickness / 32, mapHeight / 32)
      .refreshBody();

    // Create players group
    this.players = this.physics.add.group();

    // Create player in the center
    const player = new Mage(this, WINDOW_CENTER.x, WINDOW_CENTER.y, "player");
    this.players.add(player);

    // Create enemies group
    this.enemies = this.physics.add.group();

    // Create spells group
    this.overlapSpells = this.physics.add.group();
    this.collideSpells = this.physics.add.group();

    // Listen for spell cast events
    this.events.on("spellCast", (spell: any) => {
      this.overlapSpells.add(spell);
    });

    this.events.on("projectileSpellCast", (spell: any) => {
      this.collideSpells.add(spell);
    });

    // Create some enemies
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, mapWidth - 100);
      const y = Phaser.Math.Between(100, mapHeight - 100);
      const spider = new Spider(this, x, y);
      this.enemies.add(spider);
    }

    // Set up collisions
    this.physics.add.collider(this.players, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
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
    // Set up camera to follow the player
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(player, true, 0.5, 0.5);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
  }

  update() {
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
      player.takeDamage(enemy.doDamage());
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
