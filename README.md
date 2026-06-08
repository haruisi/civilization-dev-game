# Civilization Dev Game

1人用のターン制文明発展ゲームです。古代の小都市から始め、都市を育て、技術ツリーを進め、宇宙船を完成させることで科学勝利を目指します。

敵文明、戦争、外交はこの初期バージョンでは実装していません。

## 操作方法

- マップのマスをクリックすると地形と産出を確認できます。
- 都市マスをクリックすると Capital の都市情報を確認できます。
- 研究パネルから前提技術を満たした技術を選択できます。
- 建設パネルから建物や宇宙船パーツを選択できます。
- 「次のターン」で食料、生産力、知識、文化を獲得し、研究や建設を進めます。
- 宇宙船発射場を建設し、エンジン、居住区、管制システムを完成させると科学勝利です。

## 技術スタック

- React
- TypeScript
- Vite
- CSS

## Development

```bash
npm install
npm run dev
```

## Build / Preview

```bash
npm run build
npm run preview
```

## GitHub Pages

このプロジェクトは GitHub Pages の project site として公開するため、`vite.config.ts` の `base` を `/civilization-dev-game/` に設定しています。

公開手順:

1. `main` ブランチに push します。
2. GitHub Actions の `Deploy to GitHub Pages` workflow が `dist` をビルドして Pages artifact としてアップロードします。
3. Repository Settings → Pages → Build and deployment → Source を `GitHub Actions` に設定します。
