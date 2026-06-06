# Stage Editing Guide

이 문서는 `src/game/PortfolioScene.ts`를 직접 수정할 때 보는 빠른 가이드입니다.

## 좌표 기본

Phaser 좌표는 왼쪽 위가 `(0, 0)`입니다.

- `x`가 커지면 오른쪽으로 이동합니다.
- `y`가 커지면 아래로 이동합니다.
- 화면 기준 플레이어가 서는 바닥은 대략 `y = 450 ~ 540` 사이입니다.
- 한 챕터 폭은 `segmentWidth = 540`입니다.

챕터별 기준 좌표는 `getSegmentLayout(index)`에서 만듭니다.

```ts
const startX = index * segmentWidth;
const centerX = startX + 270;
```

그래서 수작업 배치는 보통 이렇게 잡으면 됩니다.

```ts
layout.centerX + 180 // 오른쪽으로 180px
layout.centerX - 120 // 왼쪽으로 120px
```

## 맵을 그리는 흐름

현재 맵은 Kenney 샘플 타일맵을 반복해서 그립니다.

1. `drawKenneySampleChunk(...)`가 샘플맵 이미지를 화면에 그립니다.
2. `createSamplePhysics(...)`가 같은 타일 데이터를 보고 충돌체를 만듭니다.
3. `createSampleMilestoneBlock(...)`가 샘플맵의 `!` 블록 위치를 찾아 팝업 충돌체로 씁니다.
4. `drawPortfolioHazard(...)`가 챕터별 몬스터를 추가합니다.

중요한 점은 이미지와 물리가 따로입니다.
화면에 보인다고 무조건 밟히는 것이 아니고, `isWalkableFrame(frame)`에 들어간 타일만 밟힙니다.

## 밟을 수 있는 타일 수정

`isWalkableFrame(frame)`을 수정합니다.

```ts
private isWalkableFrame(frame: number) {
  return (
    (frame >= 0 && frame <= 3) ||
    (frame >= 20 && frame <= 23)
  );
}
```

- 문, 줄, 장식이 밟히면 여기에서 제거합니다.
- 구름, 나무 가지를 밟게 하려면 여기에 추가합니다.
- 너무 넓은 범위는 피하세요. 예를 들어 `49~53`처럼 넣으면 사다리 부품까지 바닥이 될 수 있습니다.

## 사다리 수정

사다리는 아래 함수들이 함께 동작합니다.

- `isLadderFrame(frame)`: 어떤 타일이 사다리인지 정합니다.
- `createMergedLadders(...)`: 이어진 사다리 타일을 하나의 긴 감지 영역으로 합칩니다.
- `getActiveLadderInfo()`: 플레이어가 현재 올라탄 사다리를 찾습니다.
- `isAtLadderTop(...)`: 맨 위 점프 가능 여부를 판단합니다.
- `isAtLadderBottom(...)`: 맨 아래에서 더 내려가지 않게 판단합니다.

사다리 감지가 약하면 먼저 `createMergedLadders`의 `setDisplaySize(tileSize * 1.15, ...)`에서 폭을 키워보세요.

## 몬스터 수정

몬스터는 `drawPortfolioHazard(...)`에서 생성합니다.

```ts
hazard
  .setData('minX', layout.centerX + 120)
  .setData('maxX', layout.centerX + 410)
  .setData('speed', 44)
  .setData('direction', -1);
```

- `minX`, `maxX`: 좌우 순찰 범위
- `speed`: 이동 속도
- `direction`: 처음 방향, `-1`은 왼쪽, `1`은 오른쪽

`updateHazards()`에서 몬스터가 범위 끝이나 벽에 닿으면 방향을 바꿉니다.

## 리스폰 수정

플레이어가 떨어지면 `respawnPlayer()`가 실행됩니다.

안전 위치는 `update()` 안에서 갱신됩니다.

```ts
this.lastSafePosition = { x: this.player.x, y: Math.max(80, this.player.y - 84) };
```

- 너무 낮게 살아나면 `84`를 더 키웁니다.
- 너무 위에서 살아나면 `84`를 줄입니다.
- 특정 구간에서만 죽으면 그 구간의 바닥 frame이 `isWalkableFrame`에 있는지 확인합니다.

## 팝업 블록 수정

샘플맵의 `!` 블록은 frame `10`입니다.

```ts
const blockPosition = this.findSampleFramePosition(layout, sampleMap, 10);
```

다른 타일을 팝업 블록으로 쓰고 싶으면 `10`을 다른 frame 번호로 바꿉니다.

## 링크/이력 수정

이력과 링크는 게임 코드가 아니라 데이터에서 수정합니다.

- 이력 챕터: `src/data/portfolioTimeline.ts`의 `portfolioTimeline`
- 사이드프로젝트/GitHub 링크: `profile.links`
- 한글 문구: 각 챕터의 `ko` 필드
- 영어 문구: `title`, `summary`, `details`

## 확인 체크리스트

수정 후 아래를 확인하세요.

- 모바일 세로 화면에서 좌우 스크롤이 생기지 않는가
- EN/KO 버튼이 정상 작동하는가
- ! 블록을 아래에서 칠 때만 팝업이 열리는가
- 팝업 닫기 후 게임이 재개되는가
- 사다리 맨 아래/맨 위 판정이 자연스러운가
- 몬스터가 바닥 위에서 걷는가
- 떨어졌을 때 너무 낮은 위치에서 다시 나오지 않는가
- `npm run typecheck`, `npm run lint`, `npm run build`가 통과하는가
