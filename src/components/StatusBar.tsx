import { eraLabels } from "../data";
import { getProductionName, getTechnologyById, getTotalPopulation } from "../gameLogic";
import type { City, GameState } from "../types";

type StatusBarProps = {
  state: GameState;
  city: City | null;
};

export function StatusBar({ state, city }: StatusBarProps) {
  const research = getTechnologyById(state, state.currentResearch);
  const productionName = city ? getProductionName(city.currentProduction) : "なし";

  return (
    <header className="status-bar">
      <div className="status-item strong">
        <span>Turn</span>
        <b>{state.turn}</b>
      </div>
      <div className="status-item">
        <span>時代</span>
        <b>{eraLabels[state.era]}</b>
      </div>
      <div className="status-item civilization">
        <span>文明</span>
        <b>{state.civilizationName || "無名の文明"}</b>
      </div>
      <div className="status-item">
        <span>総人口</span>
        <b>{getTotalPopulation(state.cities)}</b>
      </div>
      <div className="status-item">
        <span>食料</span>
        <b>{state.food}</b>
      </div>
      <div className="status-item">
        <span>生産力</span>
        <b>{state.production}</b>
      </div>
      <div className="status-item">
        <span>知識</span>
        <b>{state.science}</b>
      </div>
      <div className="status-item">
        <span>文化</span>
        <b>{state.culture}</b>
      </div>
      <div className="status-item">
        <span>安定度</span>
        <b>{state.stability}</b>
      </div>
      <div className="status-item wide">
        <span>研究中</span>
        <b>{research ? research.name : "なし"}</b>
      </div>
      <div className="status-item wide">
        <span>生産中</span>
        <b>{productionName}</b>
      </div>
    </header>
  );
}
