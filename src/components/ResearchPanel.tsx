import { technologyEraLabels } from "../data";
import { getResearchStatus, getTechnologyById } from "../gameLogic";
import type { GameState } from "../types";

type ResearchPanelProps = {
  state: GameState;
  onSelectResearch: (techId: string) => void;
};

export function ResearchPanel({ state, onSelectResearch }: ResearchPanelProps) {
  const currentResearch = getTechnologyById(state, state.currentResearch);
  const eraOrder = ["ancient", "medieval", "renaissance", "industrial", "modern", "space"];

  return (
    <section className="side-section research-section">
      <div className="section-title-row">
        <h2>研究</h2>
        {currentResearch && (
          <span className="pill">
            {state.researchProgress} / {currentResearch.cost}
          </span>
        )}
      </div>

      <div className="progress-track" aria-label="研究進捗">
        <span
          style={{
            width: currentResearch
              ? `${Math.min(100, (state.researchProgress / currentResearch.cost) * 100)}%`
              : "0%",
          }}
        />
      </div>

      <div className="tech-tree">
        {eraOrder.map((era) => {
          const techs = state.technologies.filter((technology) => technology.era === era);

          return (
            <div className="tech-era" key={era}>
              <h3>{technologyEraLabels[era]}</h3>
              {techs.map((technology) => {
                const status = getResearchStatus(state, technology.id);

                return (
                  <button
                    className={`tech-button ${technology.researched ? "researched" : ""}`}
                    disabled={status.disabled}
                    key={technology.id}
                    onClick={() => onSelectResearch(technology.id)}
                    type="button"
                  >
                    <span className="option-main">
                      <b>{technology.name}</b>
                      <span>{technology.cost} 知識</span>
                    </span>
                    <span className="option-detail">
                      {technology.unlocks.join(" / ")}
                      {status.reason && <em>{status.reason}</em>}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
