import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';
import { State } from '../entities/Fighter';

export class WallBounceSystem {
  private scene: Phaser.Scene;
  private fighters: Fighter[];
  private bounceVelocityMultiplier = -0.5;
  private bounceUpwardForce = -200;

  constructor(scene: Phaser.Scene, fighters: Fighter[]) {
    this.scene = scene;
    this.fighters = fighters;

    scene.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      const fighter = this.fighters.find(f => f.body === body);
      if (!fighter) return;
      if (fighter.isDead) return;
      // Only bounce if in HIT state (being knocked back)
      if (fighter.state !== State.HIT) return;

      this.performWallBounce(fighter, body);
    });
  }

  private performWallBounce(fighter: Fighter, body: Phaser.Physics.Arcade.Body): void {
    // Only bounce on left/right walls, not top/bottom
    if (!body.blocked.left && !body.blocked.right) return;

    const currentVelX = body.velocity.x;
    // Reverse X velocity and diminish
    body.setVelocityX(currentVelX * this.bounceVelocityMultiplier);
    body.setVelocityY(this.bounceUpwardForce);
    fighter.isWallBouncing = true;

    // Camera shake on wall impact
    this.scene.cameras.main.shake(120, 0.008);

    // Spark visual at wall contact point
    const sparkX = body.blocked.left ? fighter.x - 20 : fighter.x + 20;
    this.spawnWallSpark(sparkX, fighter.y);

    // Reset wall bounce flag after brief delay
    this.scene.time.delayedCall(300, () => {
      fighter.isWallBouncing = false;
    });
  }

  private spawnWallSpark(x: number, y: number): void {
    const spark = this.scene.add.sprite(x, y, 'fx_hit_spark');
    spark.setScale(0.7);
    spark.setDepth(90);
    spark.play('fx_hit_spark');
    const uiCam = this.scene.cameras.getCamera('ui');
    if (uiCam) uiCam.ignore(spark);
    spark.once('animationcomplete', () => spark.destroy());
  }
}
