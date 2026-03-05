import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

export interface ProjectileVFX {
  createVisual(scene: Phaser.Scene, x: number, y: number, dir: number): Phaser.GameObjects.GameObject;
  updateVisual(visual: Phaser.GameObjects.GameObject, x: number, y: number): void;
  destroyVisual(visual: Phaser.GameObjects.GameObject): void;
  createImpact(scene: Phaser.Scene, x: number, y: number): void;
}

export interface AbilityVFX {
  onProjectileFire?(scene: Phaser.Scene, fighter: Fighter, dir: number): void;
  onShieldActivate?(scene: Phaser.Scene, fighter: Fighter): Phaser.GameObjects.GameObject | null;
  onShieldUpdate?(visual: Phaser.GameObjects.GameObject, fighter: Fighter): void;
  onShieldHit?(scene: Phaser.Scene, visual: Phaser.GameObjects.GameObject): void;
  onShieldRemove?(scene: Phaser.Scene, visual: Phaser.GameObjects.GameObject): void;
  onDash?(scene: Phaser.Scene, fighter: Fighter, dir: number): void;
  onDodge?(scene: Phaser.Scene, fighter: Fighter): void;
  onUltimateStart?(scene: Phaser.Scene, fighter: Fighter): void;
  onUltimateWave?(scene: Phaser.Scene, fighter: Fighter, dir: number): Phaser.GameObjects.Sprite | null;
}

function ignoreOnUI(scene: Phaser.Scene, obj: Phaser.GameObjects.GameObject): void {
  const uiCam = scene.cameras.getCamera('ui');
  if (uiCam) uiCam.ignore(obj);
}

export function generateProceduralTextures(scene: Phaser.Scene): void {
  // Small particle textures for trails (these supplement the real sprites)
  if (!scene.textures.exists('karasu_flame_particle')) {
    const g = scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(0x220011, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0x880022, 0.8);
    g.fillCircle(8, 8, 5);
    g.fillStyle(0xff2200, 0.5);
    g.fillCircle(8, 7, 3);
    g.generateTexture('karasu_flame_particle', 16, 16);
    g.destroy();
  }

  if (!scene.textures.exists('karasu_feather')) {
    const g = scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(0x111111, 1);
    g.fillEllipse(8, 4, 14, 6);
    g.fillStyle(0x330033, 0.7);
    g.fillEllipse(8, 4, 10, 4);
    g.generateTexture('karasu_feather', 16, 8);
    g.destroy();
  }
}

export function getKarasuVFX(): AbilityVFX {
  return {
    onProjectileFire(scene: Phaser.Scene, fighter: Fighter, dir: number): void {
      // Muzzle flash - hellfire burst at cast point
      const ox = fighter.x + dir * 24;
      const oy = fighter.y - 4;
      const flash = scene.add.sprite(ox, oy, 'fx_karasu_hellfire');
      flash.setScale(0.4);
      flash.setDepth(85);
      flash.setAlpha(0.8);
      ignoreOnUI(scene, flash);
      flash.play('fx_karasu_hellfire');
      flash.once('animationcomplete', () => flash.destroy());

      // Small flame particles
      for (let i = 0; i < 4; i++) {
        const p = scene.add.image(ox, oy, 'karasu_flame_particle');
        p.setScale(0.4 + Math.random() * 0.4);
        p.setAlpha(0.7);
        p.setDepth(84);
        ignoreOnUI(scene, p);
        scene.tweens.add({
          targets: p,
          x: ox + dir * (15 + Math.random() * 25),
          y: oy + (Math.random() - 0.5) * 20,
          alpha: 0,
          scale: 0.1,
          duration: 250 + Math.random() * 150,
          onComplete: () => p.destroy()
        });
      }
    },

    onShieldActivate(scene: Phaser.Scene, fighter: Fighter): Phaser.GameObjects.GameObject {
      // Play crow substitution animation at fighter pos
      const crowBurst = scene.add.sprite(fighter.x, fighter.y, 'fx_karasu_crow_sub');
      crowBurst.setScale(0.8);
      crowBurst.setDepth(82);
      crowBurst.setAlpha(0.9);
      ignoreOnUI(scene, crowBurst);
      crowBurst.play('fx_karasu_crow_sub');
      crowBurst.on('animationcomplete', () => {
        // Loop the last two frames (shadow form) while shield is active
        crowBurst.play({ key: 'fx_karasu_crow_sub', startFrame: 0, repeat: -1 });
      });

      // Scatter feather particles
      for (let i = 0; i < 8; i++) {
        const feather = scene.add.image(fighter.x, fighter.y, 'karasu_feather');
        feather.setScale(0.6 + Math.random() * 0.5);
        feather.setAlpha(0.9);
        feather.setDepth(83);
        feather.setRotation(Math.random() * Math.PI * 2);
        ignoreOnUI(scene, feather);
        const angle = (Math.PI * 2 * i) / 8;
        scene.tweens.add({
          targets: feather,
          x: fighter.x + Math.cos(angle) * (35 + Math.random() * 25),
          y: fighter.y + Math.sin(angle) * (35 + Math.random() * 25),
          rotation: feather.rotation + (Math.random() - 0.5) * 4,
          alpha: 0,
          duration: 500 + Math.random() * 300,
          onComplete: () => feather.destroy()
        });
      }

      return crowBurst;
    },

    onShieldUpdate(visual: Phaser.GameObjects.GameObject, fighter: Fighter): void {
      (visual as Phaser.GameObjects.Sprite).setPosition(fighter.x, fighter.y);
    },

    onShieldHit(scene: Phaser.Scene, visual: Phaser.GameObjects.GameObject): void {
      const sprite = visual as Phaser.GameObjects.Sprite;
      // Feather burst on hit
      for (let i = 0; i < 4; i++) {
        const feather = scene.add.image(sprite.x, sprite.y, 'karasu_feather');
        feather.setScale(0.5);
        feather.setAlpha(0.8);
        feather.setDepth(83);
        ignoreOnUI(scene, feather);
        scene.tweens.add({
          targets: feather,
          x: sprite.x + (Math.random() - 0.5) * 50,
          y: sprite.y - 15 - Math.random() * 30,
          rotation: Math.random() * 6,
          alpha: 0,
          duration: 350,
          onComplete: () => feather.destroy()
        });
      }
      scene.tweens.add({
        targets: visual,
        alpha: 0.9,
        duration: 50,
        yoyo: true
      });
    },

    onShieldRemove(scene: Phaser.Scene, visual: Phaser.GameObjects.GameObject): void {
      const sprite = visual as Phaser.GameObjects.Sprite;
      // Final crow scatter
      for (let i = 0; i < 10; i++) {
        const feather = scene.add.image(sprite.x, sprite.y, 'karasu_feather');
        feather.setScale(0.5 + Math.random() * 0.4);
        feather.setAlpha(0.8);
        feather.setDepth(83);
        ignoreOnUI(scene, feather);
        const angle = (Math.PI * 2 * i) / 10;
        scene.tweens.add({
          targets: feather,
          x: sprite.x + Math.cos(angle) * 50,
          y: sprite.y + Math.sin(angle) * 50,
          rotation: Math.random() * 8,
          alpha: 0,
          duration: 450,
          onComplete: () => feather.destroy()
        });
      }
      sprite.destroy();
    },

    onDash(scene: Phaser.Scene, fighter: Fighter, dir: number): void {
      // Phantom slash at start of dash
      const slash = scene.add.sprite(fighter.x, fighter.y, 'fx_karasu_phantom_slash');
      slash.setScale(0.7);
      slash.setDepth(86);
      slash.setFlipX(dir < 0);
      slash.setAlpha(0.9);
      ignoreOnUI(scene, slash);
      slash.play('fx_karasu_phantom_slash');
      slash.once('animationcomplete', () => slash.destroy());

      // Hellfire trail at origin
      const fire = scene.add.sprite(fighter.x, fighter.y + 25, 'fx_karasu_hellfire');
      fire.setScale(0.5);
      fire.setDepth(79);
      fire.setAlpha(0.8);
      ignoreOnUI(scene, fire);
      fire.play('fx_karasu_hellfire');
      fire.once('animationcomplete', () => fire.destroy());
    },

    onDodge(scene: Phaser.Scene, fighter: Fighter): void {
      // Crow substitution burst at dodge origin
      const crowEffect = scene.add.sprite(fighter.x, fighter.y, 'fx_karasu_crow_sub');
      crowEffect.setScale(0.7);
      crowEffect.setDepth(84);
      crowEffect.setAlpha(0.9);
      ignoreOnUI(scene, crowEffect);
      crowEffect.play('fx_karasu_crow_sub');
      crowEffect.once('animationcomplete', () => crowEffect.destroy());

      // Feather scatter
      for (let i = 0; i < 12; i++) {
        const feather = scene.add.image(fighter.x, fighter.y, 'karasu_feather');
        feather.setScale(0.5 + Math.random() * 0.7);
        feather.setAlpha(0.9);
        feather.setDepth(85);
        feather.setRotation(Math.random() * Math.PI * 2);
        ignoreOnUI(scene, feather);
        const angle = (Math.PI * 2 * i) / 12;
        const dist = 40 + Math.random() * 50;
        scene.tweens.add({
          targets: feather,
          x: fighter.x + Math.cos(angle) * dist,
          y: fighter.y + Math.sin(angle) * dist - 15,
          rotation: feather.rotation + (Math.random() - 0.5) * 6,
          alpha: 0,
          scale: 0.1,
          duration: 400 + Math.random() * 300,
          onComplete: () => feather.destroy()
        });
      }

      // Dark smoke puff
      const smoke = scene.add.circle(fighter.x, fighter.y, 18, 0x110011, 0.5);
      smoke.setDepth(83);
      ignoreOnUI(scene, smoke);
      scene.tweens.add({
        targets: smoke,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: 350,
        onComplete: () => smoke.destroy()
      });
    },

    onUltimateStart(scene: Phaser.Scene, fighter: Fighter): void {
      // Dark red screen flash
      scene.cameras.main.flash(300, 100, 0, 0, true);
      scene.cameras.main.shake(500, 0.012);

      // Hellfire ground effect under fighter
      const hellfire = scene.add.sprite(fighter.x, fighter.y + 30, 'fx_karasu_hellfire');
      hellfire.setScale(1.2);
      hellfire.setDepth(80);
      hellfire.setAlpha(0.9);
      ignoreOnUI(scene, hellfire);
      hellfire.play('fx_karasu_hellfire');
      hellfire.once('animationcomplete', () => hellfire.destroy());

      // Swirling flame particles
      for (let i = 0; i < 16; i++) {
        scene.time.delayedCall(i * 30, () => {
          if (!fighter.active) return;
          const flame = scene.add.image(fighter.x, fighter.y, 'karasu_flame_particle');
          flame.setScale(0.6 + Math.random() * 0.5);
          flame.setAlpha(0.8);
          flame.setDepth(82);
          ignoreOnUI(scene, flame);
          const angle = (Math.PI * 2 * i) / 16;
          const radius = 20 + Math.random() * 25;
          scene.tweens.add({
            targets: flame,
            x: fighter.x + Math.cos(angle) * radius,
            y: fighter.y + Math.sin(angle) * radius - 25,
            alpha: 0,
            scale: 0.1,
            duration: 350 + Math.random() * 200,
            onComplete: () => flame.destroy()
          });
        });
      }
    },

    onUltimateWave(scene: Phaser.Scene, fighter: Fighter, dir: number): Phaser.GameObjects.Sprite | null {
      // Susanoo appears and slashes
      const susanoo = scene.add.sprite(fighter.x + dir * 30, fighter.y - 10, 'fx_karasu_susanoo');
      susanoo.setScale(1.5);
      susanoo.setDepth(86);
      susanoo.setFlipX(dir < 0);
      susanoo.setAlpha(0.9);
      ignoreOnUI(scene, susanoo);
      susanoo.play('fx_karasu_susanoo');

      // Add physics for collision
      scene.physics.add.existing(susanoo, false);
      const body = susanoo.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setVelocityX(dir * 350);
      body.setSize(100, 80);

      // Phantom slash trail behind the susanoo
      const slashTrail = scene.time.addEvent({
        delay: 80,
        repeat: 20,
        callback: () => {
          if (!susanoo.active) { slashTrail.remove(); return; }
          const slash = scene.add.sprite(susanoo.x, susanoo.y, 'fx_karasu_phantom_slash');
          slash.setScale(0.6);
          slash.setDepth(85);
          slash.setAlpha(0.6);
          slash.setFlipX(dir < 0);
          ignoreOnUI(scene, slash);
          slash.play('fx_karasu_phantom_slash');
          slash.once('animationcomplete', () => slash.destroy());
        }
      });

      // Hellfire trail on the ground
      const fireTrail = scene.time.addEvent({
        delay: 120,
        repeat: 12,
        callback: () => {
          if (!susanoo.active) { fireTrail.remove(); return; }
          const fire = scene.add.sprite(susanoo.x, susanoo.y + 40, 'fx_karasu_hellfire');
          fire.setScale(0.5);
          fire.setDepth(79);
          fire.setAlpha(0.7);
          ignoreOnUI(scene, fire);
          fire.play('fx_karasu_hellfire');
          fire.once('animationcomplete', () => fire.destroy());
        }
      });

      // Clean up after 2s
      scene.time.delayedCall(2000, () => {
        slashTrail.remove();
        fireTrail.remove();
        if (susanoo.active) susanoo.destroy();
      });

      return susanoo;
    }
  };
}

export function getProjectileVFX(characterId: string): ProjectileVFX | null {
  if (characterId === 'karasu_crimson_phantom') {
    return {
      createVisual(scene: Phaser.Scene, x: number, y: number, dir: number): Phaser.GameObjects.GameObject {
        const container = scene.add.container(x, y);
        container.setDepth(50);

        // Black flame sprite as projectile visual
        const flame = scene.add.sprite(0, 0, 'fx_karasu_black_flame');
        flame.setScale(0.8);
        flame.setFlipX(dir < 0);
        flame.play('fx_karasu_black_flame');
        container.add(flame);

        // Trailing flame particles
        const trailEvent = scene.time.addEvent({
          delay: 70,
          repeat: -1,
          callback: () => {
            if (!container.active) { trailEvent.remove(); return; }
            const particle = scene.add.image(container.x, container.y, 'karasu_flame_particle');
            particle.setScale(0.25 + Math.random() * 0.25);
            particle.setAlpha(0.6);
            particle.setDepth(49);
            ignoreOnUI(scene, particle);
            scene.tweens.add({
              targets: particle,
              x: particle.x - dir * (8 + Math.random() * 12),
              y: particle.y + (Math.random() - 0.5) * 14,
              alpha: 0,
              scale: 0.05,
              duration: 180 + Math.random() * 80,
              onComplete: () => particle.destroy()
            });
          }
        });

        (container as any)._trailEvent = trailEvent;
        return container;
      },

      updateVisual(visual: Phaser.GameObjects.GameObject, x: number, y: number): void {
        (visual as Phaser.GameObjects.Container).setPosition(x, y);
      },

      destroyVisual(visual: Phaser.GameObjects.GameObject): void {
        const container = visual as any;
        if (container._trailEvent) container._trailEvent.remove();
        container.destroy();
      },

      createImpact(scene: Phaser.Scene, x: number, y: number): void {
        // Use the real flame impact sprite
        const impact = scene.add.sprite(x, y, 'fx_karasu_flame_impact');
        impact.setScale(0.6);
        impact.setDepth(90);
        ignoreOnUI(scene, impact);
        impact.play('fx_karasu_flame_impact');
        impact.once('animationcomplete', () => impact.destroy());

        // Small flame particles on impact
        for (let i = 0; i < 5; i++) {
          const p = scene.add.image(x, y, 'karasu_flame_particle');
          p.setScale(0.4 + Math.random() * 0.3);
          p.setAlpha(0.8);
          p.setDepth(91);
          ignoreOnUI(scene, p);
          const angle = (Math.PI * 2 * i) / 5;
          scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * (15 + Math.random() * 10),
            y: y + Math.sin(angle) * (15 + Math.random() * 10),
            alpha: 0,
            scale: 0.1,
            duration: 250 + Math.random() * 100,
            onComplete: () => p.destroy()
          });
        }
      }
    };
  }
  return null;
}
