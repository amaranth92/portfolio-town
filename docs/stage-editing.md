# Stage Editing Guide

Portfolio stage art is built in `src/game/PortfolioScene.ts`.

## Main Editing Points

- `getSegmentLayout(index)`: milestone block, ledge, hazard, and skill item positions.
- `drawSegmentBackground(theme, name, layout, index)`: sky, haze, water, clouds, and chapter backdrop.
- `drawKenneySampleBackdrop(layout, index)`: normal chapter background decorations.
- `drawAustraliaBackdrop(layout)`: Australia chapter decorations only.
- `drawSegmentGround(...)`: solid ground, ledges, and cloud platforms with collision.
- `drawSegmentDecor(...)`: signs, plants, collectible items, hazards, contact label.
- `src/game/assetManifest.ts`: friendly names mapped to real Kenney tile files.

## Coordinate Rules

Each timeline chapter is one segment.

```ts
const segmentWidth = 540;
const centerX = index * segmentWidth + 270;
```

Use `layout.startX` and `layout.centerX` instead of absolute world positions.

```ts
this.add.image(layout.centerX + 120, 360, 'tile:crate').setScale(2);
```

The first number moves left/right. The second number moves up/down.

- Smaller `y` means higher on the screen.
- Larger `y` means lower on the screen.
- Ground is around `y = 514`.
- Player usually stands around `y = 454`.

## Asset Names Currently Mapped

Common tiles:

- Ground: `grassLeft`, `grassMidA`, `grassMidB`, `grassRight`, `dirtA`, `dirtB`
- Blocks: `question`, `questionUsed`, `block`, `crate`
- Items: `coinA`, `coinB`, `gem`, `key`
- Platforms: `cloudLeft`, `cloudMidA`, `cloudRight`, `redPlatformLeft`, `redPlatformMid`, `redPlatformRight`
- Signs: `sign`, `arrowRight`
- Nature: `plantA`, `plantB`, `plantC`, `treeTop`, `treeFruitA`, `treeFruitB`, `trunkA`, `trunkB`, `trunkC`, `rock`
- Water and pipes: `waterTop`, `water`, `waterfall`, `pipeTopLeft`, `pipeTopRight`, `pipeBody`, `bluePipeLeft`, `bluePipeMidA`, `bluePipeMidB`, `bluePipeEnd`
- Utility: `ladderTop`, `ladder`, `springA`, `springB`, `flag`

## Safe Way To Edit

If you want to move one decoration:

```ts
this.add.image(layout.centerX + 220, 404, 'tile:crate').setScale(2.1);
```

Change only these values first:

```ts
layout.centerX + 220 // horizontal position
404                  // vertical position
2.1                  // size
```

If you want a decoration to affect gameplay, add it in `drawSegmentGround` or the relevant physics group.
If it is only visual, add it in `drawKenneySampleBackdrop`, `drawAustraliaBackdrop`, or `drawSegmentDecor`.

