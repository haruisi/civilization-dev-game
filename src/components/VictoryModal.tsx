import { eraLabels } from "../data";
import { getTotalPopulation } from "../gameLogic";
import type { GameState } from "../types";

type VictoryModalProps = {
  state: GameState;
  onRestart: () => void;
};

export function VictoryModal({ state, onRestart }: VictoryModalProps) {
  if (!state.victory) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="victory-title" className="victory-modal" role="dialog">
        <p className="eyebrow">Science Victory</p>
        <h2 id="victory-title">科学勝利！</h2>
        <dl>
          <div>
            <dt>完成ターン数</dt>
            <dd>{state.victoryTurn}</dd>
          </div>
          <div>
            <dt>文明名</dt>
            <dd>{state.civilizationName || "無名の文明"}</dd>
          </div>
          <div>
            <dt>最終時代</dt>
            <dd>{eraLabels[state.era]}</dd>
          </div>
          <div>
            <dt>総人口</dt>
            <dd>{getTotalPopulation(state.cities)}</dd>
          </div>
        </dl>
        <button className="primary-button" onClick={onRestart} type="button">
          新しい文明を始める
        </button>
      </section>
    </div>
  );
}
