import Phaser from "phaser";
import { MapGenerator } from "../Map/MapGenerator";
import { Player } from "../Players/Player";
import { Enemy } from "../Enemies/Enemy";
import { MageBasicSpell } from "../Spells/MageBasicSpell";
import { MageProjectileSpell } from "../Spells/MageProjectileSpell";
import { FireMageFireCircle } from "../Spells/FireMageFireCircle";
import { FireMageFireOrb } from "../Spells/FireMageFireOrb";
import { SnakeVenomProjectile } from "../Spells/SnakeVenomProjectile";
import { Item } from "../Items/Item";
import { Scepter } from "../Items/Scepter";
import { Letter } from "../Items/Letter";
import { Status } from "../Common/Status";
import { FireMage } from "../Players/FireMage";
import { NotesMap } from "../Common/NoteMap";

export class ColliderManager {
  private scene: Phaser.Scene;
  private mapGenerator: MapGenerator;
  private players: Phaser.Physics.Arcade.Group;
  private enemies: Phaser.Physics.Arcade.Group;
  private overlapSpells: Phaser.Physics.Arcade.Group;
  private collideSpells: Phaser.Physics.Arcade.Group;
  private healthPotions: Phaser.Physics.Arcade.Group;
  private manaPotions: Phaser.Physics.Arcade.Group;
  private healthManaPotions: Phaser.Physics.Arcade.Group;
  private scepters: Phaser.Physics.Arcade.Group;
  private letters: Phaser.Physics.Arcade.Group;
  private stairsCollider?: Phaser.Physics.Arcade.Collider;
  private currentLevel: number = 1;

  constructor(
    scene: Phaser.Scene,
    mapGenerator: MapGenerator,
    players: Phaser.Physics.Arcade.Group,
    enemies: Phaser.Physics.Arcade.Group,
    overlapSpells: Phaser.Physics.Arcade.Group,
    collideSpells: Phaser.Physics.Arcade.Group,
    healthPotions: Phaser.Physics.Arcade.Group,
    manaPotions: Phaser.Physics.Arcade.Group,
    healthManaPotions: Phaser.Physics.Arcade.Group,
    scepters: Phaser.Physics.Arcade.Group,
    letters: Phaser.Physics.Arcade.Group,
    currentLevel: number
  ) {
    this.scene = scene;
    this.mapGenerator = mapGenerator;
    this.players = players;
    this.enemies = enemies;
    this.overlapSpells = overlapSpells;
    this.collideSpells = collideSpells;
    this.healthPotions = healthPotions;
    this.manaPotions = manaPotions;
    this.healthManaPotions = healthManaPotions;
    this.scepters = scepters;
    this.letters = letters;
    this.currentLevel = currentLevel;
  }

  /**
   * Set up all collisions for the level
   */
  setupCollisions() {
    // Set up collisions with boundaries
    this.scene.physics.add.collider(
      this.players,
      this.mapGenerator.getBoundaries()
    );
    this.scene.physics.add.collider(
      this.enemies,
      this.mapGenerator.getBoundaries()
    );
    this.scene.physics.add.collider(
      this.overlapSpells,
      this.mapGenerator.getBoundaries()
    );
    this.scene.physics.add.collider(
      this.collideSpells,
      this.mapGenerator.getBoundaries(),
      this.handleSpellWallCollision,
      undefined,
      this
    );

    // Set up enemy-enemy collisions
    this.scene.physics.add.collider(
      this.enemies,
      this.enemies,
      this.handleEnemyEnemyCollision,
      undefined,
      this
    );

    // Set up player-enemy collisions
    this.scene.physics.add.collider(
      this.players,
      this.enemies,
      this.handlePlayerEnemyCollision,
      undefined,
      this
    );

    // Set up spell-enemy collisions
    this.scene.physics.add.overlap(
      this.overlapSpells,
      this.enemies,
      this.handleSpellEnemyCollision,
      undefined,
      this
    );
    this.scene.physics.add.collider(
      this.collideSpells,
      this.enemies,
      this.handleProjectileSpellEnemyCollision,
      undefined,
      this
    );
    this.scene.physics.add.collider(
      this.players,
      this.collideSpells,
      this.handleEnemySpellPlayerCollision,
      undefined,
      this
    );

    // Set up potion pickups
    this.scene.physics.add.overlap(
      this.healthPotions,
      this.players,
      this.handlePotionPickup,
      undefined,
      this
    );
    this.scene.physics.add.overlap(
      this.manaPotions,
      this.players,
      this.handlePotionPickup,
      undefined,
      this
    );
    this.scene.physics.add.overlap(
      this.healthManaPotions,
      this.players,
      this.handlePotionPickup,
      undefined,
      this
    );

    // Set up scepter pickups
    this.scene.physics.add.overlap(
      this.scepters,
      this.players,
      this.handleScepterPickup,
      undefined,
      this
    );

    // Set up letter pickups
    this.scene.physics.add.overlap(
      this.letters,
      this.players,
      this.handleLetterPickup,
      undefined,
      this
    );
  }

  /**
   * Set up stairs collision when all enemies are defeated
   * @param stairs The stairs game object
   * @param callback The callback to run when the player collides with stairs
   */
  setupStairsCollision(
    stairs: Phaser.Physics.Arcade.Group,
    callback: Function
  ) {
    this.stairsCollider = this.scene.physics.add.overlap(
      this.players,
      stairs,
      (player, _) => {
        if (player instanceof Player) {
          callback(player);
        }
      },
      undefined,
      this
    );
  }

  /**
   * Remove the stairs collider
   */
  removeStairsCollider() {
    if (this.stairsCollider) {
      this.scene.physics.world.removeCollider(this.stairsCollider);
    }
  }

  /**
   * Handle player-enemy collision
   * @param player Player object
   * @param enemy Enemy object
   */
  private handlePlayerEnemyCollision(player: any, enemy: any) {
    if (player instanceof Player && enemy instanceof Enemy) {
      if (player instanceof FireMage && player.getFireShieldCooldown()) {
        return;
      } else {
        player.takeDamage(enemy.doDamage());
        player.smallKnockback();
      }
    }
  }

  /**
   * Handle enemy-enemy collision
   * @param enemy1 First enemy object
   * @param enemy2 Second enemy object
   */
  private handleEnemyEnemyCollision(enemy1: any, enemy2: any) {
    if (enemy1 instanceof Enemy && enemy2 instanceof Enemy) {
      enemy1.knockback(enemy2);
    }
  }

  /**
   * Handle spell-enemy collision for overlap spells
   * @param spell Spell object
   * @param enemy Enemy object
   */
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
            this.scene,
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
            this.scene,
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

  /**
   * Handle projectile spell-enemy collision
   * @param projectileSpell Projectile spell object
   * @param enemy Enemy object
   */
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

  /**
   * Handle enemy spell-player collision
   * @param player Player object
   * @param spell Spell object
   */
  private handleEnemySpellPlayerCollision(player: any, spell: any) {
    if (player instanceof Player && spell instanceof SnakeVenomProjectile) {
      // Only do damage if spell is still in active animation frame
      if (
        spell.anims.currentAnim?.key === spell.getStartAnimationKey() ||
        spell.anims.currentAnim?.key === spell.getIdleAnimationKey()
      ) {
        player.takeDamage(
          spell.getDamage(),
          new Status(this.scene, player, "venom", 5, 2000, 1000, () => {
            player.onStatusFinished();
          })
        );
        spell.destroy(true);
      }
    }
  }

  /**
   * Handle spell-wall collision
   * @param spell Spell object
   * @param _ Wall object
   */
  private handleSpellWallCollision(spell: any, _: any) {
    spell.destroy(true);
  }

  /**
   * Handle potion pickup
   * @param potion Potion object
   * @param player Player object
   */
  private handlePotionPickup(potion: any, player: any) {
    if (
      potion instanceof Item &&
      player instanceof Player &&
      potion.canUse(player)
    ) {
      potion.use(player);
    }
  }

  /**
   * Handle scepter pickup
   * @param scepter Scepter object
   * @param player Player object
   */
  private handleScepterPickup(scepter: any, player: any) {
    if (
      scepter instanceof Scepter &&
      player instanceof Player &&
      scepter.canUse(player)
    ) {
      scepter.use(player);
    }
  }

  /**
   * Handle letter pickup
   * @param letter Letter object
   * @param player Player object
   */
  private handleLetterPickup(letter: any, player: any) {
    if (letter instanceof Letter && player instanceof Player) {
      // Pause current scene and start ReadNoteScene
      const noteId = letter.collect();
      this.scene.scene.pause();
      this.scene.scene.launch("ReadNoteScene", {
        text: NotesMap.get(noteId) || "",
        parentScene: this.scene,
        onClose: () => {
          this.scene.scene.resume();
        },
        bloody: this.currentLevel > 2 ? this.currentLevel * 5 : 0,
      });
      this.letters.clear(true, true);
    }
  }
}
