import Phaser from 'phaser';
import type { ArenaData, Arena, SpawnPoint } from '../types';
import type { Fighter } from '../entities/Fighter';

export class ArenaFactory {
  static build(scene: Phaser.Scene, arenaData: ArenaData): Arena {
    const arena: Arena = {
      data: arenaData,
      groundGroup: scene.physics.add.staticGroup(),
      platformGroup: scene.physics.add.staticGroup(),
      spawnPoints: arenaData.spawnPoints || []
    };

    scene.cameras.main.setBackgroundColor(arenaData.backgroundColor || '#1a1a2e');

    const bounds = arenaData.bounds;
    scene.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    for (const g of arenaData.ground) {
      const plat = scene.add.rectangle(g.x, g.y, g.width, g.height, g.color);
      scene.physics.add.existing(plat, true);
      arena.groundGroup.add(plat);
    }

    for (const p of arenaData.platforms) {
      const plat = scene.add.rectangle(p.x, p.y, p.width, p.height, p.color);
      scene.physics.add.existing(plat, true);
      arena.platformGroup.add(plat);
    }

    return arena;
  }

  static addFighterCollision(scene: Phaser.Scene, fighter: Fighter, arena: Arena): void {
    scene.physics.add.collider(fighter, arena.groundGroup);

    scene.physics.add.collider(
      fighter,
      arena.platformGroup,
      undefined,
      (fighterObj) => {
        const f = fighterObj as Fighter;
        if (f.canDropThrough) return false;
        if (f.body.velocity.y <= 0) return false;
        return true;
      },
      scene
    );
  }

  static getSpawnPoint(arena: Arena, playerIndex: number): SpawnPoint {
    const spawns = arena.spawnPoints;
    return spawns[playerIndex % spawns.length];
  }
}
