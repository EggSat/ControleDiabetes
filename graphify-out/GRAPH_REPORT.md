# Graph Report - _Controle Diabetes_Historico  (2026-09-16)

## Corpus Check
- 24 files · ~149,532 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .bat 1, .css 1)

## Summary
- 69 nodes · 171 edges · 6 communities (5 shown, 1 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71b9216b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- number
- app.js
- renderHistory
- setupUserFoods
- getStored
- todayKey

## God Nodes (most connected - your core abstractions)
1. `number()` - 14 edges
2. `setupUserFoods()` - 12 edges
3. `renderHistory()` - 10 edges
4. `getStored()` - 9 edges
5. `selectFood()` - 8 edges
6. `getCarbDose()` - 7 edges
7. `buildHistorySnapshot()` - 7 edges
8. `renderMeals()` - 7 edges
9. `loadFoodSearch()` - 7 edges
10. `historyExportRows()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `cumulativeHistory()` --calls--> `number()`  [EXTRACTED]
  app.js → app.js  _Bridges community 0 → community 2_
- `selectFood()` --calls--> `number()`  [EXTRACTED]
  app.js → app.js  _Bridges community 0 → community 4_
- `setupUserFoods()` --calls--> `number()`  [EXTRACTED]
  app.js → app.js  _Bridges community 0 → community 3_
- `historyFoodDescription()` --calls--> `normalizeSearchText()`  [EXTRACTED]
  app.js → app.js  _Bridges community 3 → community 2_
- `rankFoods()` --calls--> `normalizeSearchText()`  [EXTRACTED]
  app.js → app.js  _Bridges community 3 → community 4_

## Import Cycles
- None detected.

## Communities (6 total, 1 thin omitted)

### Community 0 - "number"
Cohesion: 0.23
Nodes (17): buildHistorySnapshot(), currentFoodCalculation(), format(), formatNutrition(), getCarbDose(), getCarbTargets(), getCorrectionDose(), getEntries() (+9 more)

### Community 1 - "app.js"
Cohesion: 0.12
Nodes (10): currentResults, foodEditor, foodIndex, foodSearchInput, foodSearchResults, foodSearchStatus, historyMealLabels, mealTypes (+2 more)

### Community 2 - "renderHistory"
Cohesion: 0.21
Nodes (14): cumulativeHistory(), exportHistoryExcel(), exportHistoryPdf(), formatHistoryNumber(), formatHistoryValue(), getInsulinHistory(), historyExportRows(), historyFoodDescription() (+6 more)

### Community 3 - "setupUserFoods"
Cohesion: 0.42
Nodes (11): foodNameKey(), foodWithSearch(), getUserFoods(), loadFoodSearch(), loadUserFoodsIntoCatalog(), normalizeSearchText(), populateUserFoodMeasures(), renderUserFoodManagement() (+3 more)

### Community 4 - "getStored"
Cohesion: 0.28
Nodes (9): foodReference(), getFavorites(), getRecents(), getRecentsByMeal(), getStored(), rankFoods(), selectFood(), suggestedMeal() (+1 more)

## Knowledge Gaps
- **10 isolated node(s):** `themeToggle`, `foodSearchInput`, `foodSearchResults`, `foodSearchStatus`, `foodEditor` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 15 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `number()` connect `number` to `app.js`, `renderHistory`, `setupUserFoods`, `getStored`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `setupUserFoods()` connect `setupUserFoods` to `number`, `app.js`, `renderHistory`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `renderHistory()` connect `renderHistory` to `app.js`, `setupUserFoods`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `themeToggle`, `foodSearchInput`, `foodSearchResults` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._