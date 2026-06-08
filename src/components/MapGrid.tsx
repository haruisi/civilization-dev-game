import { terrainEmoji, terrainLabels } from "../data";
import type { SelectedTile, Tile } from "../types";

type MapGridProps = {
  map: Tile[][];
  selectedTile: SelectedTile;
  onSelectTile: (tile: Tile) => void;
};

export function MapGrid({ map, selectedTile, onSelectTile }: MapGridProps) {
  return (
    <section className="map-panel" aria-label="文明マップ">
      <div className="map-grid">
        {map.flatMap((row) =>
          row.map((tile) => {
            const isSelected = selectedTile.x === tile.x && selectedTile.y === tile.y;
            const classes = [
              "map-tile",
              `terrain-${tile.terrain}`,
              tile.cityId ? "has-city" : "",
              isSelected ? "selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                aria-label={`${terrainLabels[tile.terrain]} ${tile.x + 1},${tile.y + 1}`}
                className={classes}
                key={`${tile.x}-${tile.y}`}
                onClick={() => onSelectTile(tile)}
                type="button"
              >
                <span className="tile-emoji" aria-hidden="true">
                  {tile.cityId ? "🏛️" : terrainEmoji[tile.terrain]}
                </span>
                <span className="tile-coord">
                  {tile.x + 1},{tile.y + 1}
                </span>
              </button>
            );
          }),
        )}
      </div>
    </section>
  );
}
