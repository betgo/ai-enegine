import type { GameDefinition } from "@ai-enegine/schema";
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  DirectionalLight,
  GridHelper,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import {
  createTowerDefenseSimulation,
  type RuntimeSimulationState
} from "./simulation";

export type { RuntimeMonsterState, RuntimeSimulationState } from "./simulation";
export type {
  RuntimeBaseState,
  RuntimeGameStatus,
  RuntimeMonsterStatus,
  RuntimeWaveState
} from "./simulation";

export interface RuntimeRenderer {
  domElement: HTMLElement;
  setPixelRatio(value: number): void;
  setSize(width: number, height: number): void;
  render(scene: Scene, camera: PerspectiveCamera): void;
  dispose(): void;
}

export interface TowerDefenseRuntimeOptions {
  game: GameDefinition;
  container?: HTMLElement;
  width?: number;
  height?: number;
  rendererFactory?: () => RuntimeRenderer;
}

export interface SceneSummary {
  mapId: string;
  mapSize: {
    width: number;
    height: number;
  };
  tileCount: number;
  pathCount: number;
  towerSlotCount: number;
}

export interface TowerDefenseRuntime {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: RuntimeRenderer;
  getSceneSummary(): SceneSummary;
  tick(deltaMs: number): void;
  getState(): RuntimeSimulationState;
  render(): void;
  dispose(): void;
}

export function createTowerDefenseRuntime(
  options: TowerDefenseRuntimeOptions
): TowerDefenseRuntime {
  const renderer = options.rendererFactory?.() ?? createDefaultRenderer();
  const width = options.width ?? options.container?.clientWidth ?? 800;
  const height = options.height ?? options.container?.clientHeight ?? 600;
  const scene = new Scene();
  const camera = createCamera(options.game, width, height);

  scene.background = new Color(0x101820);
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  options.container?.appendChild(renderer.domElement);
  buildMapScene(scene, options.game);

  const simulation = createTowerDefenseSimulation(options.game);

  return {
    scene,
    camera,
    renderer,
    getSceneSummary() {
      return {
        mapId: options.game.map.id,
        mapSize: {
          width: options.game.map.size.width,
          height: options.game.map.size.height
        },
        tileCount: options.game.map.tiles.length,
        pathCount: options.game.map.paths.length,
        towerSlotCount: options.game.map.towerSlots.length
      };
    },
    tick(deltaMs) {
      simulation.tick(deltaMs);
    },
    getState() {
      return simulation.getState();
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      renderer.dispose();
      options.container?.removeChild(renderer.domElement);
      disposeObject(scene);
    }
  };
}

function createDefaultRenderer(): RuntimeRenderer {
  return new WebGLRenderer({
    antialias: true
  });
}

function createCamera(
  game: GameDefinition,
  width: number,
  height: number
): PerspectiveCamera {
  const camera = new PerspectiveCamera(50, width / height, 0.1, 1000);
  const centerX = game.map.size.width / 2;
  const centerZ = game.map.size.height / 2;
  const distance = Math.max(game.map.size.width, game.map.size.height, 6);

  camera.position.set(centerX, distance, centerZ + distance);
  camera.lookAt(centerX, 0, centerZ);

  return camera;
}

function buildMapScene(scene: Scene, game: GameDefinition): void {
  const gridSize = Math.max(game.map.size.width, game.map.size.height);
  const grid = new GridHelper(gridSize, gridSize);

  grid.position.set(game.map.size.width / 2 - 0.5, 0.01, game.map.size.height / 2 - 0.5);
  scene.add(new AmbientLight(0xffffff, 1.8));

  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(4, 8, 6);
  scene.add(sun);
  scene.add(grid);

  game.map.tiles.forEach((tile) => {
    const geometry = new BoxGeometry(0.92, 0.08, 0.92);
    const material = new MeshBasicMaterial({
      color: getTileColor(tile.kind)
    });
    const mesh = new Mesh(geometry, material);

    mesh.name = `tile:${tile.x}:${tile.y}:${tile.kind}`;
    mesh.position.set(tile.x, 0, tile.y);
    scene.add(mesh);
  });

  game.map.paths.forEach((path) => {
    const points = path.points.map((point) => new Vector3(point.x, 0.12, point.y));
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({
      color: 0xffd166
    });
    const line = new Line(geometry, material);

    line.name = `path:${path.id}`;
    scene.add(line);
  });

  game.map.towerSlots.forEach((slot) => {
    const geometry = new BoxGeometry(0.42, 0.45, 0.42);
    const material = new MeshBasicMaterial({
      color: 0x6c63ff
    });
    const marker = new Mesh(geometry, material);

    marker.name = `tower-slot:${slot.id}`;
    marker.position.set(slot.x, 0.28, slot.y);
    scene.add(marker);
  });
}

function getTileColor(kind: string): number {
  if (kind === "path") {
    return 0xc9a66b;
  }

  if (kind === "tower-slot") {
    return 0x7f9cf5;
  }

  if (kind === "blocked") {
    return 0x2d3748;
  }

  return 0x4ade80;
}

function disposeObject(object: Object3D): void {
  object.traverse((child) => {
    const maybeMesh = child as {
      geometry?: { dispose(): void };
      material?: { dispose(): void } | Array<{ dispose(): void }>;
    };

    maybeMesh.geometry?.dispose();

    if (Array.isArray(maybeMesh.material)) {
      maybeMesh.material.forEach((material) => material.dispose());
    } else {
      maybeMesh.material?.dispose();
    }
  });

  object.clear();
}
