import Phaser from "phaser";
import { Mage } from "../Players/Mage";
import { MapGenerator } from "../Map/MapGenerator";

export class MageTeleportSpell extends Phaser.GameObjects.Sprite {
  private caster: Mage;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    caster: Mage
  ) {
    super(scene, x, y, texture);
    this.caster = caster;

    this.createAnimations();
  }

  public static canTeleport(
    facing: string,
    teleportDistance: number,
    targetX: number,
    targetY: number,
    mapGenerator: MapGenerator
  ): { x: number; y: number } | null {
    // Calculate target position based on facing direction
    if (facing === "up") {
      targetY -= teleportDistance;
    } else if (facing === "down") {
      targetY += teleportDistance;
    } else if (facing === "left") {
      targetX -= teleportDistance;
    } else if (facing === "right") {
      targetX += teleportDistance;
    }

    // Check for wall collisions at the target position
    // Convert target position to map coordinates
    const mapPosition = mapGenerator.pixelToMap(targetX, targetY);

    // Get map dimensions
    const mapWidth = mapGenerator.getMapWidth();
    const mapHeight = mapGenerator.getMapHeight();

    // Check if teleport destination is within map bounds
    const withinBounds =
      mapPosition.x > 1 &&
      mapPosition.x < mapWidth - 2 &&
      mapPosition.y > 1 &&
      mapPosition.y < mapHeight - 2;

    // Check if the target position is in a room (which is valid for teleporting)
    // or collides with a boundary
    const boundaries = mapGenerator.getBoundaries();
    const tileSize = mapGenerator.getTileSize();

    // Check for boundary collisions
    const noWallCollisions = !boundaries.getChildren().some((wall: any) => {
      return Phaser.Geom.Rectangle.Overlaps(
        new Phaser.Geom.Rectangle(targetX - 8, targetY - 12, 16, 24),
        new Phaser.Geom.Rectangle(
          wall.x - tileSize / 2,
          wall.y - tileSize / 2,
          tileSize,
          tileSize
        )
      );
    });

    if (withinBounds && noWallCollisions) {
      return { x: targetX, y: targetY };
    } else {
      return null;
    }
  }

  private createAnimations(): void {
    this.anims.create({
      key: this.getStartAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_teleport_spell`,
        {
          start: 0,
          end: 23,
        }
      ),
      frameRate: 32,
      repeat: 0,
    });

    this.anims.create({
      key: this.getEndAnimationKey(),
      frames: this.anims.generateFrameNumbers(
        `${this.caster.getPrefix()}_teleport_spell`,
        {
          start: 23,
          end: 0,
        }
      ),
      frameRate: 32,
      repeat: 0,
    });
  }

  startTeleport(x: number, y: number): void {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // Set size and depth to appear above other sprites
    this.setScale(0.75);

    this.x = x;
    this.y = y;
    this.play(this.getStartAnimationKey());
  }

  endTeleport(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.play(this.getEndAnimationKey()).once("animationcomplete", () => {
      this.destroy();
    });
  }

  getStartAnimationKey(): string {
    return `${this.caster.getPrefix()}_teleport_start`;
  }

  getEndAnimationKey(): string {
    return `${this.caster.getPrefix()}_teleport_end`;
  }
}
