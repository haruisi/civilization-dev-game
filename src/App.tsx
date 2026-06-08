import { useMemo, useState } from "react";
import "./App.css";
import { CityPanel } from "./components/CityPanel";
import { LogPanel } from "./components/LogPanel";
import { MapGrid } from "./components/MapGrid";
import { ProductionPanel } from "./components/ProductionPanel";
import { ResearchPanel } from "./components/ResearchPanel";
import { StatusBar } from "./components/StatusBar";
import { VictoryModal } from "./components/VictoryModal";
import {
  advanceTurn,
  createInitialGameState,
  selectProduction,
  selectResearch,
  updateCivilizationName,
} from "./gameLogic";
import type { SelectedTile, Tile } from "./types";

function App() {
  const [gameState, setGameState] = useState(createInitialGameState);
  const [selectedTilePosition, setSelectedTilePosition] = useState<SelectedTile>({
    x: 4,
    y: 5,
  });

  const selectedTile = useMemo(
    () => gameState.map[selectedTilePosition.y][selectedTilePosition.x],
    [gameState.map, selectedTilePosition],
  );
  const selectedCity = useMemo(() => {
    if (selectedTile.cityId) {
      return gameState.cities.find((city) => city.id === selectedTile.cityId) ?? null;
    }

    return gameState.cities[0] ?? null;
  }, [gameState.cities, selectedTile.cityId]);

  const handleSelectTile = (tile: Tile) => {
    setSelectedTilePosition({ x: tile.x, y: tile.y });
  };

  const handleNextTurn = () => {
    setGameState((currentState) => advanceTurn(currentState));
  };

  const handleRestart = () => {
    setGameState(createInitialGameState());
    setSelectedTilePosition({ x: 4, y: 5 });
  };

  return (
    <main className="game-layout">
      <StatusBar city={selectedCity} state={gameState} />

      <section className="command-bar" aria-label="ターン操作">
        <div>
          <p className="eyebrow">Asteria Chronicle</p>
          <h1>文明発展ゲーム</h1>
        </div>
        <button
          className="primary-button"
          disabled={gameState.victory}
          onClick={handleNextTurn}
          type="button"
        >
          次のターン
        </button>
      </section>

      <div className="play-area">
        <MapGrid
          map={gameState.map}
          onSelectTile={handleSelectTile}
          selectedTile={selectedTilePosition}
        />

        <aside className="side-panel">
          <CityPanel
            city={selectedCity}
            onCivilizationNameChange={(name) =>
              setGameState((currentState) => updateCivilizationName(currentState, name))
            }
            selectedTile={selectedTile}
            state={gameState}
          />
          <ResearchPanel
            onSelectResearch={(techId) =>
              setGameState((currentState) => selectResearch(currentState, techId))
            }
            state={gameState}
          />
          <ProductionPanel
            city={selectedCity}
            onSelectProduction={(cityId, productionId) =>
              setGameState((currentState) =>
                selectProduction(currentState, cityId, productionId),
              )
            }
            state={gameState}
          />
        </aside>
      </div>

      <LogPanel logs={gameState.logs} />
      <VictoryModal onRestart={handleRestart} state={gameState} />
    </main>
  );
}

export default App;
