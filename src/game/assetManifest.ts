const base = new URL(`${import.meta.env.BASE_URL}assets/kenney/pixel-platformer`, window.location.href).toString().replace(/\/$/, '');

export const assetManifest = {
  base,
  tiles: {
    grassLeft: `${base}/Tiles/tile_0000.png`,
    grassMidA: `${base}/Tiles/tile_0001.png`,
    grassMidB: `${base}/Tiles/tile_0002.png`,
    grassRight: `${base}/Tiles/tile_0003.png`,
    dirtA: `${base}/Tiles/tile_0120.png`,
    dirtB: `${base}/Tiles/tile_0121.png`,
    dirtC: `${base}/Tiles/tile_0122.png`,
    dirtD: `${base}/Tiles/tile_0123.png`,
    question: `${base}/Tiles/tile_0010.png`,
    questionUsed: `${base}/Tiles/tile_0011.png`,
    block: `${base}/Tiles/tile_0009.png`,
    coinA: `${base}/Tiles/tile_0151.png`,
    coinB: `${base}/Tiles/tile_0152.png`,
    cloudLeft: `${base}/Tiles/tile_0153.png`,
    cloudMidA: `${base}/Tiles/tile_0154.png`,
    cloudMidB: `${base}/Tiles/tile_0155.png`,
    cloudRight: `${base}/Tiles/tile_0156.png`,
    sign: `${base}/Tiles/tile_0084.png`,
    arrow: `${base}/Tiles/tile_0087.png`,
    ladderTop: `${base}/Tiles/tile_0051.png`,
    ladder: `${base}/Tiles/tile_0071.png`,
    gem: `${base}/Tiles/tile_0067.png`,
    key: `${base}/Tiles/tile_0027.png`,
    pipeTopLeft: `${base}/Tiles/tile_0093.png`,
    pipeTopRight: `${base}/Tiles/tile_0094.png`,
    pipeBody: `${base}/Tiles/tile_0095.png`,
    plantA: `${base}/Tiles/tile_0124.png`,
    plantB: `${base}/Tiles/tile_0128.png`,
    plantC: `${base}/Tiles/tile_0129.png`
  },
  characters: {
    player: `${base}/Tiles/Characters/tile_0000.png`,
    playerWalkA: `${base}/Tiles/Characters/tile_0001.png`,
    playerWalkB: `${base}/Tiles/Characters/tile_0002.png`,
    playerJump: `${base}/Tiles/Characters/tile_0003.png`,
    enemyA: `${base}/Tiles/Characters/tile_0015.png`,
    enemyB: `${base}/Tiles/Characters/tile_0017.png`,
    robotA: `${base}/Tiles/Characters/tile_0018.png`
  },
  backgrounds: {
    cloudA: `${base}/Tiles/Backgrounds/tile_0008.png`,
    cloudB: `${base}/Tiles/Backgrounds/tile_0009.png`
  }
} as const;

export type AssetKey = keyof typeof assetManifest.tiles | keyof typeof assetManifest.characters | keyof typeof assetManifest.backgrounds;
