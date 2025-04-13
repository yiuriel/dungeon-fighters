export class Status {
  private target: any;
  private type: string;
  private damage: number;
  private duration: number;
  private tickInterval: number;
  private remainingDuration: number;
  private scene: Phaser.Scene;
  private tickTimer?: Phaser.Time.TimerEvent;
  private isActive: boolean = false;
  private onStatusFinished: () => void;

  constructor(
    scene: Phaser.Scene,
    target: any,
    type: string,
    damage: number,
    duration: number,
    tickInterval: number,
    onStatusFinished: () => void
  ) {
    this.scene = scene;
    this.target = target;
    this.type = type;
    this.damage = damage;
    this.duration = duration;
    this.tickInterval = tickInterval;
    this.remainingDuration = duration;
    this.onStatusFinished = onStatusFinished;
  }

  public apply(): void {
    if (this.isActive) {
      // Don't reapply if already active
      return;
    }

    this.isActive = true;
    this.remainingDuration = this.duration;

    // Start the damage tick timer
    this.tickTimer = this.scene.time.addEvent({
      delay: this.tickInterval,
      callback: this.tick,
      callbackScope: this,
      loop: true,
    });

    // Set timer to remove status after duration
    this.scene.time.delayedCall(this.duration, this.remove, [], this);
  }

  private tick(): void {
    if (
      this.target &&
      this.target.active &&
      typeof this.target.takeDamage === "function"
    ) {
      this.target.takeDamage(this.damage);
      this.remainingDuration -= this.tickInterval;
    }
  }

  public remove(): void {
    if (this.tickTimer) {
      this.tickTimer.remove();
      this.tickTimer = undefined;
    }
    this.isActive = false;
    this.onStatusFinished();
  }

  public getType(): string {
    return this.type;
  }

  public isStatusActive(): boolean {
    return this.isActive;
  }
}
