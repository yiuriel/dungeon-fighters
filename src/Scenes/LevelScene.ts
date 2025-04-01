import Phaser from "phaser";
import { WINDOW_CENTER } from "../constants";
import { Enemy } from "../Enemies/Enemy";
import Spider from "../Enemies/Spider";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";

export default class LevelScene extends Phaser.Scene {
  private players!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;

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

    // Top wall
    this.walls
      .create(mapWidth / 2, 0, "tiles")
      .setScale(mapWidth / 32, wallThickness / 32)
      .refreshBody();

    // Bottom wall
    this.walls
      .create(mapWidth / 2, mapHeight, "tiles")
      .setScale(mapWidth / 32, wallThickness / 32)
      .refreshBody();

    // Left wall
    this.walls
      .create(0, mapHeight / 2, "tiles")
      .setScale(wallThickness / 32, mapHeight / 32)
      .refreshBody();

    // Right wall
    this.walls
      .create(mapWidth, mapHeight / 2, "tiles")
      .setScale(wallThickness / 32, mapHeight / 32)
      .refreshBody();

    // Create players group
    this.players = this.physics.add.group();

    // Create player in the center
    const player = new Mage(this, WINDOW_CENTER.x, WINDOW_CENTER.y, "player");
    this.players.add(player);

    // Create enemies group
    this.enemies = this.physics.add.group();

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
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(
      this.players,
      this.enemies,
      this.handlePlayerEnemyCollision,
      undefined,
      this
    );

    // Set up camera to follow the player
    this.cameras.main.startFollow(player, true, 0.5, 0.5);
  }

  update(time: number, delta: number) {
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
    player.takeDamage(enemy.getDamage());
  }
}
