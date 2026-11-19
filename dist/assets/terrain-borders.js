/* White LOS borders on the printed Korea and Vietnam terrain cards, with the title upright. */
(() => {
  'use strict';
  const all = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const eastWest = ['E', 'W'];
  const northSouth = ['N', 'S'];
  const borders = new Map();

  function assign(deck, first, last, edges) {
    for (let number = first; number <= last; number++) {
      borders.set(deck + String(number).padStart(2, '0'), edges);
    }
  }

  for (const deck of ['K', 'VN']) {
    assign(deck, 1, 55, []);
    assign(deck, 17, 24, all);
  }
  assign('K', 31, 42, all);
  assign('K', 43, 45, eastWest);
  assign('K', 46, 48, northSouth);
  assign('K', 49, 51, eastWest);
  assign('K', 52, 54, northSouth);
  assign('K', 55, 55, all);
  assign('VN', 41, 42, all);
  assign('VN', 49, 50, eastWest);
  assign('VN', 51, 52, northSouth);

  // Both catalogs contain some of the same card IDs.
  for (const card of [...window.FOF_CAMPAIGN_TERRAIN, ...(window.FOF_COURSE_TERRAIN || [])]) {
    if (borders.has(card.id)) card.openEdges = borders.get(card.id);
  }
})();
