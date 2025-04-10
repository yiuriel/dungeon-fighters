import Phaser from "phaser";

export default class AssetPreloadScene extends Phaser.Scene {
  constructor() {
    super("AssetPreloadScene");
  }

  preload() {
    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Loading...", {
        font: "20px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    // Loading event handlers
    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
      console.log("Loading progress:", value);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      console.log("Loading complete");
    });

    // Load assets
    this.load.spritesheet("spider", "assets/enemies/spider.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    // Add more assets as needed

    this.load.spritesheet("mage", "assets/players/mage.png", {
      frameWidth: 24,
      frameHeight: 32,
    });

    this.load.spritesheet(
      "mage_basic_spell",
      "assets/spells/mage_basic_spell.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "mage_projectile_spell",
      "assets/spells/mage_projectile_spell.png",
      {
        frameWidth: 24,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      "mage_teleport_spell",
      "assets/spells/mage_teleport_spell.png",
      {
        frameWidth: 96,
        frameHeight: 96,
      }
    );

    this.load.spritesheet("fire_mage", "assets/players/fire_mage.png", {
      frameWidth: 24,
      frameHeight: 32,
    });

    this.load.spritesheet(
      "fire_mage_shield",
      "assets/spells/fire_mage_shield.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );

    this.load.spritesheet(
      "fire_mage_circle",
      "assets/spells/fire_mage_fire_circle_spell.png",
      {
        frameWidth: 96,
        frameHeight: 96,
      }
    );

    this.load.spritesheet(
      "fire_mage_orb",
      "assets/spells/fire_mage_fire_orb_spell.png",
      {
        frameWidth: 80,
        frameHeight: 80,
      }
    );

    console.log("Assets loaded");
  }

  create() {
    this.scene.start("StartScreenScene");
  }
}
