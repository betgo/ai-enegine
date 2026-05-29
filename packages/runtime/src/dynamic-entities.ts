import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Scene
} from "three";
import type { RuntimeSimulationState } from "./simulation";

export interface DynamicEntityRenderer {
  sync(state: RuntimeSimulationState): void;
  dispose(): void;
}

export function createDynamicEntityRenderer(scene: Scene): DynamicEntityRenderer {
  const monsters = new Map<string, Mesh>();

  return {
    sync(state) {
      const activeMonsterIds = new Set<string>();

      state.monsters.forEach((monster) => {
        if (monster.status !== "active") {
          return;
        }

        activeMonsterIds.add(monster.id);
        const mesh = getOrCreateMonsterMesh(scene, monsters, monster.id);
        mesh.position.set(monster.position.x, 0.36, monster.position.y);
      });

      monsters.forEach((mesh, monsterId) => {
        if (!activeMonsterIds.has(monsterId)) {
          scene.remove(mesh);
          disposeMesh(mesh);
          monsters.delete(monsterId);
        }
      });
    },
    dispose() {
      monsters.forEach((mesh) => {
        scene.remove(mesh);
        disposeMesh(mesh);
      });
      monsters.clear();
    }
  };
}

function getOrCreateMonsterMesh(
  scene: Scene,
  monsters: Map<string, Mesh>,
  monsterId: string
): Mesh {
  const currentMesh = monsters.get(monsterId);

  if (currentMesh) {
    return currentMesh;
  }

  const mesh = new Mesh(
    new BoxGeometry(0.34, 0.44, 0.34),
    new MeshBasicMaterial({ color: 0xef4444 })
  );

  mesh.name = `monster:${monsterId}`;
  monsters.set(monsterId, mesh);
  scene.add(mesh);

  return mesh;
}

function disposeMesh(mesh: Mesh): void {
  mesh.geometry.dispose();

  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((material) => material.dispose());
  } else {
    mesh.material.dispose();
  }
}
