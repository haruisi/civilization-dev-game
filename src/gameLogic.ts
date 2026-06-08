import {
  buildings,
  eraLabels,
  improvementYields,
  spaceshipParts,
  technologies,
  terrainYields,
} from "./data";
import type {
  Building,
  City,
  Era,
  GameState,
  ProductionOption,
  SpaceshipPart,
  TerrainType,
  Tile,
  Yield,
} from "./types";

const mapBlueprint: TerrainType[][] = [
  ["sea", "sea", "river", "plains", "forest", "hill", "mountain", "desert", "plains", "sea"],
  ["sea", "river", "plains", "forest", "hill", "plains", "desert", "forest", "river", "sea"],
  ["plains", "plains", "forest", "hill", "mountain", "forest", "river", "plains", "desert", "sea"],
  ["forest", "hill", "plains", "river", "forest", "hill", "plains", "mountain", "plains", "sea"],
  ["desert", "plains", "forest", "river", "plains", "mountain", "forest", "hill", "river", "sea"],
  ["plains", "forest", "river", "plains", "plains", "forest", "river", "plains", "hill", "sea"],
  ["forest", "plains", "hill", "forest", "hill", "mountain", "plains", "river", "forest", "sea"],
  ["hill", "river", "plains", "desert", "forest", "plains", "hill", "plains", "sea", "sea"],
  ["sea", "plains", "forest", "hill", "river", "plains", "desert", "forest", "sea", "sea"],
  ["sea", "sea", "plains", "forest", "hill", "mountain", "river", "sea", "sea", "sea"],
];

const emptyYield = (): Yield => ({
  food: 0,
  production: 0,
  science: 0,
  culture: 0,
});

const logLine = (turn: number, message: string) => `ターン${turn}: ${message}`;

const addYield = (base: Yield, addition: Yield): Yield => ({
  food: base.food + addition.food,
  production: base.production + addition.production,
  science: base.science + addition.science,
  culture: base.culture + addition.culture,
});

const clampStability = (value: number) => Math.min(100, Math.max(0, value));

const makeUnique = (values: string[]) => Array.from(new Set(values));

export const createInitialMap = (): Tile[][] =>
  mapBlueprint.map((row, y) =>
    row.map((terrain, x) => ({
      x,
      y,
      terrain,
      cityId: x === 4 && y === 5 ? "capital" : undefined,
    })),
  );

export const createInitialGameState = (): GameState => ({
  turn: 1,
  civilizationName: "Asteria",
  era: "ancient",
  map: createInitialMap(),
  cities: [
    {
      id: "capital",
      name: "Capital",
      x: 4,
      y: 5,
      population: 1,
      foodStored: 0,
      buildings: [],
      currentProduction: "monument",
      productionProgress: 0,
    },
  ],
  food: 0,
  production: 0,
  science: 0,
  culture: 0,
  stability: 80,
  currentResearch: "agriculture",
  researchProgress: 0,
  technologies: technologies.map((technology) => ({ ...technology })),
  researchedTechs: [],
  completedSpaceshipParts: [],
  logs: [
    logLine(1, "記念碑の建設を開始した。"),
    logLine(1, "農業の研究を開始した。"),
    logLine(1, "Capitalを建設した。"),
  ],
  victory: false,
  victoryTurn: null,
});

export const getTotalPopulation = (cities: City[]) =>
  cities.reduce((total, city) => total + city.population, 0);

export const getTechnologyById = (state: GameState, id: string | null) =>
  state.technologies.find((technology) => technology.id === id) ?? null;

export const getBuildingById = (id: string | null) =>
  buildings.find((building) => building.id === id) ?? null;

export const getSpaceshipPartById = (id: string | null) =>
  spaceshipParts.find((part) => part.id === id) ?? null;

export const getProductionName = (id: string | null) =>
  getBuildingById(id)?.name ?? getSpaceshipPartById(id)?.name ?? "なし";

export const getProductionCost = (id: string | null) =>
  getBuildingById(id)?.cost ?? getSpaceshipPartById(id)?.cost ?? 0;

export const getResearchedSet = (state: GameState) =>
  new Set(state.technologies.filter((technology) => technology.researched).map((technology) => technology.id));

export const missingPrerequisiteNames = (state: GameState, prerequisites: string[]) => {
  const researched = getResearchedSet(state);
  return prerequisites
    .filter((techId) => !researched.has(techId))
    .map((techId) => state.technologies.find((technology) => technology.id === techId)?.name ?? techId);
};

export const getResearchStatus = (state: GameState, techId: string) => {
  const technology = getTechnologyById(state, techId);

  if (!technology) {
    return { disabled: true, reason: "技術が見つかりません" };
  }

  if (technology.researched) {
    return { disabled: true, reason: "研究済み" };
  }

  if (state.currentResearch === technology.id) {
    return { disabled: true, reason: "研究中" };
  }

  const missing = missingPrerequisiteNames(state, technology.prerequisites);
  if (missing.length > 0) {
    return { disabled: true, reason: `前提技術が不足: ${missing.join("、")}` };
  }

  return { disabled: false, reason: null };
};

export const getProductionOptions = (state: GameState, city: City): ProductionOption[] => {
  const researched = getResearchedSet(state);
  const buildingOptions = buildings.map((building): ProductionOption => {
    if (city.buildings.includes(building.id)) {
      return { ...building, category: "building", disabled: true, reason: "すでに建設済み" };
    }

    if (city.currentProduction === building.id) {
      return { ...building, category: "building", disabled: true, reason: "生産中" };
    }

    if (building.requiredTech && !researched.has(building.requiredTech)) {
      const techName = state.technologies.find((technology) => technology.id === building.requiredTech)?.name;
      return {
        ...building,
        category: "building",
        disabled: true,
        reason: `前提技術が不足: ${techName ?? building.requiredTech}`,
      };
    }

    return { ...building, category: "building", disabled: false, reason: null };
  });

  const partOptions = spaceshipParts.map((part): ProductionOption => {
    if (state.completedSpaceshipParts.includes(part.id)) {
      return { ...part, category: "spaceship", disabled: true, reason: "すでに完成済み" };
    }

    if (city.currentProduction === part.id) {
      return { ...part, category: "spaceship", disabled: true, reason: "生産中" };
    }

    if (!researched.has("spacecraftConstruction")) {
      return {
        ...part,
        category: "spaceship",
        disabled: true,
        reason: "前提技術が不足: 宇宙船建造",
      };
    }

    const missingTechs = missingPrerequisiteNames(state, part.requiredTechs);
    if (missingTechs.length > 0) {
      return {
        ...part,
        category: "spaceship",
        disabled: true,
        reason: `前提技術が不足: ${missingTechs.join("、")}`,
      };
    }

    if (!city.buildings.includes(part.requiredBuilding)) {
      return {
        ...part,
        category: "spaceship",
        disabled: true,
        reason: "必要建物が不足: 宇宙船発射場",
      };
    }

    return { ...part, category: "spaceship", disabled: false, reason: null };
  });

  return [...buildingOptions, ...partOptions];
};

export const selectResearch = (state: GameState, techId: string): GameState => {
  const status = getResearchStatus(state, techId);
  const technology = getTechnologyById(state, techId);

  if (status.disabled || !technology) {
    return state;
  }

  return {
    ...state,
    currentResearch: techId,
    researchProgress: 0,
    logs: [logLine(state.turn, `${technology.name}の研究を開始した。`), ...state.logs].slice(0, 40),
  };
};

export const selectProduction = (state: GameState, cityId: string, productionId: string): GameState => {
  const city = state.cities.find((candidate) => candidate.id === cityId);
  if (!city) {
    return state;
  }

  const option = getProductionOptions(state, city).find((candidate) => candidate.id === productionId);
  if (!option || option.disabled) {
    return state;
  }

  return {
    ...state,
    cities: state.cities.map((candidate) =>
      candidate.id === cityId
        ? { ...candidate, currentProduction: productionId, productionProgress: 0 }
        : candidate,
    ),
    logs: [logLine(state.turn, `${city.name}で${option.name}の生産を開始した。`), ...state.logs].slice(0, 40),
  };
};

export const updateCivilizationName = (state: GameState, civilizationName: string): GameState => ({
  ...state,
  civilizationName,
});

const stabilityModifier = (stability: number) => {
  if (stability >= 70) {
    return 1;
  }

  if (stability >= 40) {
    return 0.9;
  }

  return 0.75;
};

const applyStabilityModifier = (yieldValue: Yield, stability: number): Yield => {
  const modifier = stabilityModifier(stability);

  return {
    food: Math.max(0, Math.round(yieldValue.food * modifier)),
    production: Math.max(0, Math.round(yieldValue.production * modifier)),
    science: Math.max(0, Math.round(yieldValue.science * modifier)),
    culture: Math.max(0, Math.round(yieldValue.culture * modifier)),
  };
};

const calculateCityYield = (state: GameState, city: City): Yield => {
  const researched = getResearchedSet(state);
  let cityYield = emptyYield();

  for (let y = city.y - 1; y <= city.y + 1; y += 1) {
    for (let x = city.x - 1; x <= city.x + 1; x += 1) {
      const tile = state.map[y]?.[x];
      if (!tile) {
        continue;
      }

      cityYield = addYield(cityYield, terrainYields[tile.terrain]);
      if (tile.improvement) {
        cityYield = addYield(cityYield, improvementYields[tile.improvement]);
      }
    }
  }

  for (const buildingId of city.buildings) {
    const building = getBuildingById(buildingId);
    if (!building) {
      continue;
    }

    cityYield.food += building.effect.food ?? 0;
    cityYield.production += building.effect.production ?? 0;
    cityYield.science += building.effect.science ?? 0;
    cityYield.culture += building.effect.culture ?? 0;
  }

  if (researched.has("irrigation")) {
    cityYield.food += 1;
  }

  if (researched.has("engineering")) {
    cityYield.production += 2;
  }

  if (researched.has("scientificMethod")) {
    cityYield.science += 5;
  }

  if (researched.has("physics")) {
    cityYield.science += 5;
  }

  if (researched.has("mathematics")) {
    cityYield.science = Math.round(cityYield.science * 1.1);
  }

  return cityYield;
};

const growCityIfNeeded = (city: City, logs: string[], turn: number) => {
  let nextCity = { ...city };

  while (nextCity.foodStored >= nextCity.population * 20) {
    const requiredFood = nextCity.population * 20;
    nextCity = {
      ...nextCity,
      population: nextCity.population + 1,
      foodStored: nextCity.foodStored - requiredFood,
    };
    logs.push(logLine(turn, `${nextCity.name}の人口が${nextCity.population}に増加した。`));
  }

  return nextCity;
};

const applyBuildingStabilityEffect = (building: Building, stability: number) =>
  clampStability(stability + (building.effect.stability ?? 0));

const finishProductionIfReady = (
  city: City,
  state: GameState,
  logs: string[],
  turn: number,
) => {
  const building = getBuildingById(city.currentProduction);
  const spaceshipPart = getSpaceshipPartById(city.currentProduction);
  const cost = building?.cost ?? spaceshipPart?.cost ?? 0;
  let nextCity = { ...city };
  let nextState = state;

  if (!nextCity.currentProduction || cost === 0 || nextCity.productionProgress < cost) {
    return { city: nextCity, state: nextState };
  }

  if (building) {
    nextCity = {
      ...nextCity,
      buildings: makeUnique([...nextCity.buildings, building.id]),
      currentProduction: null,
      productionProgress: 0,
    };
    nextState = {
      ...nextState,
      stability: applyBuildingStabilityEffect(building, nextState.stability),
    };
    logs.push(logLine(turn, `${nextCity.name}で${building.name}が完成した。`));
  }

  if (spaceshipPart) {
    nextCity = {
      ...nextCity,
      currentProduction: null,
      productionProgress: 0,
    };
    nextState = {
      ...nextState,
      completedSpaceshipParts: makeUnique([...nextState.completedSpaceshipParts, spaceshipPart.id]),
    };
    logs.push(logLine(turn, `宇宙船${spaceshipPart.name}が完成した。`));
  }

  return { city: nextCity, state: nextState };
};

const applyTechnologyEffect = (state: GameState, techId: string) => {
  if (techId === "law") {
    return { ...state, stability: clampStability(state.stability + 10) };
  }

  return state;
};

const finishResearchIfReady = (state: GameState, logs: string[], turn: number) => {
  if (!state.currentResearch) {
    return state;
  }

  const technology = getTechnologyById(state, state.currentResearch);
  if (!technology || state.researchProgress < technology.cost) {
    return state;
  }

  const technologiesWithResearch = state.technologies.map((candidate) =>
    candidate.id === technology.id ? { ...candidate, researched: true } : candidate,
  );
  let nextState: GameState = {
    ...state,
    technologies: technologiesWithResearch,
    researchedTechs: makeUnique([...state.researchedTechs, technology.id]),
    currentResearch: null,
    researchProgress: 0,
  };

  nextState = applyTechnologyEffect(nextState, technology.id);
  logs.push(logLine(turn, `${technology.name}の研究が完了した。`));

  return nextState;
};

const determineEra = (state: GameState): Era => {
  const researched = getResearchedSet(state);

  if (researched.has("rocketry")) {
    return "space";
  }

  if (researched.has("electricity")) {
    return "modern";
  }

  if (researched.has("industrialization")) {
    return "industrial";
  }

  if (researched.has("writing") && researched.has("law")) {
    return "kingdom";
  }

  if (researched.has("agriculture") && researched.has("mining")) {
    return "agricultural";
  }

  return "ancient";
};

const checkVictory = (state: GameState) => {
  const researched = getResearchedSet(state);
  const hasSpaceport = state.cities.some((city) => city.buildings.includes("spaceport"));
  const hasAllParts = spaceshipParts.every((part) => state.completedSpaceshipParts.includes(part.id));

  return researched.has("spacecraftConstruction") && hasSpaceport && hasAllParts;
};

const applyStabilityMaintenance = (state: GameState, turnYield: Yield, logs: string[], turn: number) => {
  const requiredCulture = Math.max(2, state.cities.length * 2);

  if (turnYield.culture >= requiredCulture) {
    const nextStability = clampStability(state.stability + 1);
    if (nextStability !== state.stability) {
      logs.push(logLine(turn, `文化が秩序を支え、安定度が${nextStability}になった。`));
    }
    return { ...state, stability: nextStability };
  }

  const nextStability = clampStability(state.stability - 1);
  if (nextStability !== state.stability) {
    logs.push(logLine(turn, `文化の不足で安定度が${nextStability}になった。`));
  }
  return { ...state, stability: nextStability };
};

const applyFoodToCapital = (state: GameState, amount: number, logs: string[], turn: number) => ({
  ...state,
  cities: state.cities.map((city, index) =>
    index === 0 ? growCityIfNeeded({ ...city, foodStored: Math.max(0, city.foodStored + amount) }, logs, turn) : city,
  ),
});

const applyProductionToCapital = (state: GameState, amount: number, logs: string[], turn: number) => {
  let nextState = {
    ...state,
    cities: state.cities.map((city, index) =>
      index === 0 ? { ...city, productionProgress: Math.max(0, city.productionProgress + amount) } : city,
    ),
  };
  const capital = nextState.cities[0];

  if (!capital) {
    return nextState;
  }

  const completion = finishProductionIfReady(capital, nextState, logs, turn);
  nextState = {
    ...completion.state,
    cities: nextState.cities.map((city) => (city.id === capital.id ? completion.city : city)),
  };

  return nextState;
};

const applyScienceProgress = (state: GameState, amount: number, logs: string[], turn: number) => {
  let nextState = state.currentResearch
    ? { ...state, researchProgress: state.researchProgress + amount }
    : state;

  nextState = finishResearchIfReady(nextState, logs, turn);
  return nextState;
};

const applyRandomEvent = (state: GameState, logs: string[], turn: number) => {
  if (Math.random() >= 0.1) {
    return state;
  }

  const eventIndex = Math.floor(Math.random() * 8);

  if (eventIndex === 0) {
    logs.push(logLine(turn, "豊作が発生した。食料 +30。"));
    return {
      ...applyFoodToCapital(state, 30, logs, turn),
      food: state.food + 30,
    };
  }

  if (eventIndex === 1) {
    logs.push(logLine(turn, "干ばつが発生した。食料 -30。"));
    return {
      ...applyFoodToCapital(state, -30, logs, turn),
      food: Math.max(0, state.food - 30),
    };
  }

  if (eventIndex === 2) {
    logs.push(logLine(turn, "技術者が誕生した。知識 +25。"));
    return {
      ...applyScienceProgress(state, 25, logs, turn),
      science: state.science + 25,
    };
  }

  if (eventIndex === 3) {
    logs.push(logLine(turn, "祭りが開かれた。文化 +20、安定度 +5。"));
    return {
      ...state,
      culture: state.culture + 20,
      stability: clampStability(state.stability + 5),
    };
  }

  if (eventIndex === 4) {
    const largestCity = [...state.cities].sort((first, second) => second.population - first.population)[0];
    logs.push(logLine(turn, "疫病が発生した。最大人口都市の人口 -1、安定度 -10。"));
    return {
      ...state,
      cities: state.cities.map((city) =>
        city.id === largestCity.id ? { ...city, population: Math.max(1, city.population - 1) } : city,
      ),
      stability: clampStability(state.stability - 10),
    };
  }

  if (eventIndex === 5) {
    logs.push(logLine(turn, "資源を発見した。生産力 +30。"));
    return {
      ...applyProductionToCapital(state, 30, logs, turn),
      production: state.production + 30,
    };
  }

  if (eventIndex === 6) {
    logs.push(logLine(turn, "反乱の兆しが広がった。安定度 -10。"));
    return {
      ...state,
      stability: clampStability(state.stability - 10),
    };
  }

  logs.push(logLine(turn, "交易が成功した。食料 +15、生産力 +15、文化 +10。"));
  return {
    ...applyProductionToCapital(applyFoodToCapital(state, 15, logs, turn), 15, logs, turn),
    food: state.food + 15,
    production: state.production + 15,
    culture: state.culture + 10,
  };
};

export const advanceTurn = (state: GameState): GameState => {
  if (state.victory) {
    return state;
  }

  const turn = state.turn + 1;
  const logs: string[] = [];
  let nextState: GameState = {
    ...state,
    turn,
    cities: state.cities.map((city) => ({ ...city, buildings: [...city.buildings] })),
    technologies: state.technologies.map((technology) => ({ ...technology })),
    researchedTechs: [...state.researchedTechs],
    completedSpaceshipParts: [...state.completedSpaceshipParts],
  };

  let turnYield = emptyYield();
  const processedCities: City[] = [];

  for (const city of nextState.cities) {
    const rawYield = calculateCityYield(nextState, city);
    const adjustedYield = applyStabilityModifier(rawYield, nextState.stability);
    turnYield = addYield(turnYield, adjustedYield);

    let nextCity = growCityIfNeeded(
      { ...city, foodStored: city.foodStored + adjustedYield.food },
      logs,
      turn,
    );

    if (nextCity.currentProduction) {
      nextCity = {
        ...nextCity,
        productionProgress: nextCity.productionProgress + adjustedYield.production,
      };
      const completion = finishProductionIfReady(nextCity, nextState, logs, turn);
      nextState = completion.state;
      nextCity = completion.city;
    }

    processedCities.push(nextCity);
  }

  nextState = {
    ...nextState,
    cities: processedCities,
    food: Math.max(0, nextState.food + turnYield.food),
    production: Math.max(0, nextState.production + turnYield.production),
    science: Math.max(0, nextState.science + turnYield.science),
    culture: Math.max(0, nextState.culture + turnYield.culture),
  };

  nextState = applyScienceProgress(nextState, turnYield.science, logs, turn);
  nextState = applyStabilityMaintenance(nextState, turnYield, logs, turn);

  const nextEra = determineEra(nextState);
  if (nextEra !== nextState.era) {
    logs.push(logLine(turn, `${eraLabels[nextEra]}に到達した。`));
    nextState = { ...nextState, era: nextEra };
  }

  nextState = applyRandomEvent(nextState, logs, turn);

  if (checkVictory(nextState)) {
    logs.push(logLine(turn, "科学勝利を達成した。宇宙船が星々へ旅立った。"));
    nextState = { ...nextState, victory: true, victoryTurn: turn };
  }

  logs.push(
    logLine(
      turn,
      `食料 +${turnYield.food}、生産力 +${turnYield.production}、知識 +${turnYield.science}、文化 +${turnYield.culture} を得た。`,
    ),
  );

  return {
    ...nextState,
    logs: [...logs.reverse(), ...state.logs].slice(0, 40),
  };
};

export const getTileYield = (tile: Tile) => {
  let tileYield = terrainYields[tile.terrain];

  if (tile.improvement) {
    tileYield = addYield(tileYield, improvementYields[tile.improvement]);
  }

  return tileYield;
};

export const isProductionBuilding = (item: Building | SpaceshipPart | null): item is Building =>
  item !== null && "effect" in item;
