import Phaser from "phaser";
import { NotesMap } from "../Common/NoteMap";
import { Enemy } from "../Enemies/Enemy";
import Octopus from "../Enemies/Octopus";
import Snake from "../Enemies/Snake";
import Spider from "../Enemies/Spider";
import { HealthManaPotion } from "../Items/HealthManaPotion";
import { HealthPotion } from "../Items/HealthPotion";
import { ManaPotion } from "../Items/ManaPotion";
import { Scepter } from "../Items/Scepter";
import { MapGenerator } from "../Map/MapGenerator";
import { FireMage } from "../Players/FireMage";
import { Mage } from "../Players/Mage";
import { Player } from "../Players/Player";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";
import { Letter } from "../Items/Letter";
import { ReadNote } from "../Graphics/ReadNote";
import { SceneManager } from "../helpers/SceneManager";
import { ColliderManager } from "../Managers/ColliderManager";

export default class LevelScene extends Phaser.Scene {
  private players!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private overlapSpells!: Phaser.Physics.Arcade.Group;
  private collideSpells!: Phaser.Physics.Arcade.Group;
  private healthPotions!: Phaser.Physics.Arcade.Group;
  private manaPotions!: Phaser.Physics.Arcade.Group;
  private healthManaPotions!: Phaser.Physics.Arcade.Group;
  private scepters!: Phaser.Physics.Arcade.Group;
  private letters!: Phaser.Physics.Arcade.Group;
  private mapGenerator: MapGenerator;
  private player!: Player;
  private currentLevel: number = 1;
  private levelFinishCooldown: boolean = false;
  private levelTransitionCooldown: boolean = false;
  private readNote: boolean = false;
  private sceneManager: SceneManager;
  private colliderManager!: ColliderManager;

  constructor() {
    super("LevelScene");
    this.sceneManager = new SceneManager(this);
    this.mapGenerator = new MapGenerator(this);
  }

  preload() {
    this.mapGenerator.preload();
  }

  prepareLevel() {
    // Clear existing content
    this.children.removeAll();

    this.physics.world.drawDebug = true;

    // Create a simple bounded area with walls
    this.mapGenerator.generateMap();

    // Create players group
    this.players = this.physics.add.group();

    // Create letters group
    this.letters = this.physics.add.group();
    if (this.currentLevel === 2) {
      const { x, y } = this.mapGenerator.getRandomNonRoomPosition();
      const letter = new Letter(this, x, y, "second-note");
      this.letters.add(letter);
    }

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

    // Shake camera effect
    this.cameras.main.shake(
      300,
      0.005,
      false,
      (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress === 1) {
          // Reset camera when shake is complete
          camera.resetFX();
        }
      }
    );

    // Create enemies group
    this.enemies = this.physics.add.group();

    // Create spells group
    this.overlapSpells = this.physics.add.group();
    this.collideSpells = this.physics.add.group();

    // Create potions group
    this.healthPotions = this.physics.add.group();
    this.manaPotions = this.physics.add.group();
    this.healthManaPotions = this.physics.add.group();
    this.scepters = this.physics.add.group();

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

    this.events.on("playerDied", () => {
      this.time.delayedCall(1000, () => {
        this.scene.stop();
        this.scene.start("StartScreenScene");
      });
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

    // Initialize and setup collisions using the ColliderManager
    this.colliderManager = new ColliderManager(
      this,
      this.mapGenerator,
      this.players,
      this.enemies,
      this.overlapSpells,
      this.collideSpells,
      this.healthPotions,
      this.manaPotions,
      this.healthManaPotions,
      this.scepters,
      this.letters
    );

    this.colliderManager.setupCollisions();
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
    this.sceneManager.fadeIn(500);

    if (this.currentLevel === 1) {
      const firstNote = new ReadNote(this, NotesMap.get("first-note") || "");
      firstNote.show().then(() => {
        this.readNote = true;
        this.prepareLevel();
      });
    }
  }

  async update() {
    if (!this.readNote) {
      return;
    }

    // Check if all enemies are defeated
    if (
      this.enemies &&
      this.enemies.getChildren().length === 0 &&
      !this.levelFinishCooldown
    ) {
      this.levelFinishCooldown = true;
      this.cameras.main.shake(
        300,
        0.03,
        true,
        (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
          if (progress === 1) {
            const stairs = this.mapGenerator.createStairs();
            this.colliderManager.setupStairsCollision(
              stairs,
              this.handlePlayerStairsCollision.bind(this)
            );
          }
        }
      );
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

  private handlePlayerStairsCollision(_: Player) {
    this.colliderManager.removeStairsCollider();
    if (!this.levelTransitionCooldown) {
      this.levelTransitionCooldown = true;
      console.log("Player collided with stairs");
      this.sceneManager.fadeOut(500).then(() => {
        // Increase level
        this.currentLevel++;
        this.prepareLevel();

        this.sceneManager.fadeIn(500).then(() => {
          this.levelFinishCooldown = false;
          this.levelTransitionCooldown = false;
        });
      });
    }
  }
}
