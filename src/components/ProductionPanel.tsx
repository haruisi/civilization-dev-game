import { getProductionOptions } from "../gameLogic";
import type { City, GameState } from "../types";

type ProductionPanelProps = {
  state: GameState;
  city: City | null;
  onSelectProduction: (cityId: string, productionId: string) => void;
};

export function ProductionPanel({ state, city, onSelectProduction }: ProductionPanelProps) {
  if (!city) {
    return (
      <section className="side-section">
        <h2>建設</h2>
        <p className="muted">都市を選択してください。</p>
      </section>
    );
  }

  const options = getProductionOptions(state, city);
  const buildingOptions = options.filter((option) => option.category === "building");
  const spaceshipOptions = options.filter((option) => option.category === "spaceship");

  return (
    <section className="side-section production-section">
      <div className="section-title-row">
        <h2>建設</h2>
        <span className="pill">{city.name}</span>
      </div>

      <div className="option-group">
        <h3>建物</h3>
        {buildingOptions.map((option) => (
          <button
            className="production-button"
            disabled={option.disabled}
            key={option.id}
            onClick={() => onSelectProduction(city.id, option.id)}
            type="button"
          >
            <span className="option-main">
              <b>{option.name}</b>
              <span>{option.cost} 生産力</span>
            </span>
            {option.reason && <em>{option.reason}</em>}
          </button>
        ))}
      </div>

      <div className="option-group">
        <h3>宇宙船</h3>
        {spaceshipOptions.map((option) => (
          <button
            className="production-button spaceship"
            disabled={option.disabled}
            key={option.id}
            onClick={() => onSelectProduction(city.id, option.id)}
            type="button"
          >
            <span className="option-main">
              <b>{option.name}</b>
              <span>{option.cost} 生産力</span>
            </span>
            {option.reason && <em>{option.reason}</em>}
          </button>
        ))}
      </div>
    </section>
  );
}
