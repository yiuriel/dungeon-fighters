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

    // load game_cover
    this.load.image("game_cover", "assets/common/game_cover.png");

    // load enemies and players
    this.load.spritesheet("spider", "assets/enemies/spider.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("octopus", "assets/enemies/octopus.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("snake", "assets/enemies/snake.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("mage", "assets/players/mage.png", {
      frameWidth: 24,
      frameHeight: 32,
    });

    this.load.spritesheet("fire_mage", "assets/players/fire_mage.png", {
      frameWidth: 24,
      frameHeight: 32,
    });
    // load enemies and players finish

    // load spells
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

    this.load.spritesheet("snake_venom", "assets/spells/snake_venom.png", {
      frameWidth: 32,
      frameHeight: 16,
    });
    // load spells finish

    // load items
    this.load.spritesheet("potions", "assets/items/potions.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("gold", "assets/items/gold.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("scepter", "assets/items/scepter.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("letter", "assets/items/letter.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(
      "monster_die_particle",
      "assets/common/monster_die_particle.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet("blood_1", "assets/common/blood_1.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("blood_2", "assets/common/blood_2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("blood_3", "assets/common/blood_3.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Load UI assets
    this.load.spritesheet("fire_particle", "assets/common/fire_particle.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    // load items finish

    // load sounds
    this.load.audio("pickup_item", "assets/sounds/pickup_item.wav");
    this.load.audio("pickup_potion", "assets/sounds/pickup_potion.wav");

    this.load.audio("potion_1", "assets/sounds/potions/potion_1.mp3");
    this.load.audio("potion_2", "assets/sounds/potions/potion_2.mp3");
    this.load.audio("potion_3", "assets/sounds/potions/potion_3.mp3");
    this.load.audio("potion_4", "assets/sounds/potions/potion_4.mp3");
    this.load.audio("scepter_1", "assets/sounds/scepter/scepter_pickup_1.mp3");
    this.load.audio("scepter_2", "assets/sounds/scepter/scepter_pickup_2.mp3");
    this.load.audio("scepter_3", "assets/sounds/scepter/scepter_pickup_3.mp3");
    this.load.audio("scepter_4", "assets/sounds/scepter/scepter_pickup_4.mp3");
    this.load.audio("scepter_5", "assets/sounds/scepter/scepter_pickup_5.mp3");

    // spells
    this.load.audio("fireball", "assets/sounds/spells/fireball.mp3");
    this.load.audio("fireorb", "assets/sounds/spells/fireorb.mp3");
    this.load.audio("teleport", "assets/sounds/spells/teleport.mp3");

    // background
    this.load.audio(
      "background_loop_01",
      "public/assets/sounds/background/background_loop_1.wav"
    );

    // letter collect
    this.load.audio(
      "letter_collect",
      "assets/sounds/letter/letter_collect.mp3"
    );
    // load sounds finish

    console.log("Assets loaded");
  }

  create() {
    this.scene.start("StartScreenScene");
  }
}
