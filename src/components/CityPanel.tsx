import { buildings, improvementLabels, terrainLabels } from "../data";
import { getProductionCost, getProductionName, getTileYield } from "../gameLogic";
import type { City, GameState, Tile } from "../types";

type CityPanelProps = {
  state: GameState;
  city: City | null;
  selectedTile: Tile;
  onCivilizationNameChange: (name: string) => void;
};

const formatYield = (value: number) => (value > 0 ? `+${value}` : String(value));

export function CityPanel({
  state,
  city,
  selectedTile,
  onCivilizationNameChange,
}: CityPanelProps) {
  const tileYield = getTileYield(selectedTile);
  const buildingNames = city?.buildings.map(
    (buildingId) => buildings.find((building) => building.id === buildingId)?.name ?? buildingId,
  );
  const productionCost = getProductionCost(city?.currentProduction ?? null);

  return (
    <section className="side-section">
      <div className="section-title-row">
        <h2>都市</h2>
        {city && <span className="pill">{city.name}</span>}
      </div>

      <label className="field">
        <span>文明名</span>
        <input
          maxLength={32}
          onChange={(event) => onCivilizationNameChange(event.target.value)}
          value={state.civilizationName}
        />
      </label>

      {city ? (
        <div className="city-stats">
          <div>
            <span>人口</span>
            <b>{city.population}</b>
          </div>
          <div>
            <span>食料貯蔵</span>
            <b>
              {city.foodStored} / {city.population * 20}
            </b>
          </div>
          <div>
            <span>生産進捗</span>
            <b>
              {city.productionProgress} / {productionCost || "-"}
            </b>
          </div>
          <div>
            <span>生産中</span>
            <b>{getProductionName(city.currentProduction)}</b>
          </div>
        </div>
      ) : (
        <p className="muted">都市マスを選択すると都市情報を表示します。</p>
      )}

      <div className="tile-readout">
        <h3>選択マス</h3>
        <dl>
          <div>
            <dt>座標</dt>
            <dd>
              {selectedTile.x + 1}, {selectedTile.y + 1}
            </dd>
          </div>
          <div>
            <dt>地形</dt>
            <dd>{terrainLabels[selectedTile.terrain]}</dd>
          </div>
          <div>
            <dt>改善</dt>
            <dd>{selectedTile.improvement ? improvementLabels[selectedTile.improvement] : "なし"}</dd>
          </div>
          <div>
            <dt>産出</dt>
            <dd>
              食料 {formatYield(tileYield.food)} / 生産 {formatYield(tileYield.production)} / 知識{" "}
              {formatYield(tileYield.science)} / 文化 {formatYield(tileYield.culture)}
            </dd>
          </div>
        </dl>
      </div>

      {city && (
        <div className="building-list">
          <h3>建設済み</h3>
          {buildingNames && buildingNames.length > 0 ? (
            <ul>
              {buildingNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">まだ建物はありません。</p>
          )}
        </div>
      )}
    </section>
  );
}
