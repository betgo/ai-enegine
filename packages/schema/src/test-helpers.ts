import type { GameDefinition } from "./index";

export const validGame: GameDefinition = {
  version: "0.1.0",
  base: {
    maxHp: 20
  },
  map: {
    id: "demo-map",
    name: "Demo Map",
    size: {
      width: 8,
      height: 6
    },
    tiles: [
      {
        x: 0,
        y: 0,
        kind: "path"
      },
      {
        x: 1,
        y: 0,
        kind: "tower-slot"
      }
    ],
    paths: [
      {
        id: "main",
        points: [
          { x: 0, y: 0 },
          { x: 7, y: 5 }
        ]
      }
    ],
    towerSlots: [
      {
        id: "slot-1",
        x: 1,
        y: 0
      }
    ]
  },
  units: [],
  towers: [],
  waves: [],
  triggers: []
};
