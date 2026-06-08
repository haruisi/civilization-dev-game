export type TerrainType =
  | "plains"
  | "forest"
  | "hill"
  | "mountain"
  | "river"
  | "sea"
  | "desert";

export type ImprovementType = "farm" | "mine" | "lumber";

export type Yield = {
  food: number;
  production: number;
  science: number;
  culture: number;
};

export type Tile = {
  x: number;
  y: number;
  terrain: TerrainType;
  cityId?: string;
  improvement?: ImprovementType;
};

export type City = {
  id: string;
  name: string;
  x: number;
  y: number;
  population: number;
  foodStored: number;
  buildings: string[];
  currentProduction: string | null;
  productionProgress: number;
};

export type Technology = {
  id: string;
  name: string;
  cost: number;
  prerequisites: string[];
  unlocks: string[];
  era: string;
  researched: boolean;
};

export type Building = {
  id: string;
  name: string;
  cost: number;
  requiredTech: string | null;
  effect: Partial<Yield> & { stability?: number };
  description: string;
};

export type SpaceshipPart = {
  id: string;
  name: string;
  cost: number;
  requiredTechs: string[];
  requiredBuilding: string;
};

export type ProductionOption = {
  id: string;
  name: string;
  cost: number;
  category: "building" | "spaceship";
  disabled: boolean;
  reason: string | null;
};

export type Era =
  | "ancient"
  | "agricultural"
  | "kingdom"
  | "industrial"
  | "modern"
  | "space";

export type GameState = {
  turn: number;
  civilizationName: string;
  era: Era;
  map: Tile[][];
  cities: City[];
  food: number;
  production: number;
  science: number;
  culture: number;
  stability: number;
  currentResearch: string | null;
  researchProgress: number;
  technologies: Technology[];
  researchedTechs: string[];
  completedSpaceshipParts: string[];
  logs: string[];
  victory: boolean;
  victoryTurn: number | null;
};

export type SelectedTile = {
  x: number;
  y: number;
};
