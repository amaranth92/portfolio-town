# Portfolio Town 작업 프로세스
 

## 유지보수 보강 메모

### React와 Phaser 경계
- `src/game/gameEvents.ts`는 React UI와 Phaser Scene 사이의 유일한 이벤트 버스입니다. Phaser 내부에서 React state를 직접 만지지 않고, React도 Phaser 객체에 직접 접근하지 않는 구조를 유지해야 씬 재생성/정리 시 이벤트가 꼬이지 않습니다.
- 팝업은 Phaser가 `milestone-open`을 발행한 뒤 씬을 pause하고, React 팝업의 닫기 버튼이나 점프 입력이 `resume-game`을 발행해 다시 진행합니다. 새 닫기 동작을 추가할 때는 `activeMilestone` 상태와 Phaser pause/resume이 같은 이벤트에 묶여 있는지 확인하세요.
- 모바일 조작은 `TouchControls`가 전역 `touch-control` 이벤트를 발행하고 `PortfolioScene`이 pressed 상태를 보관합니다. pointer cancel/leave를 누락하면 모바일에서 이동키가 계속 눌린 상태로 남을 수 있습니다.

### Phaser 물리와 타일맵 주의사항
- 보이는 타일과 실제 Arcade 충돌체는 분리되어 있습니다. `drawKenneySampleChunk()`는 렌더링만 담당하고, `createSamplePhysics()`가 `isWalkableFrame`, `isLadderFrame`, `isSpringFrame`, `isSampleCollectibleFrame` 기준으로 보이지 않는 충돌체를 만듭니다.
- 사다리는 개별 타일 충돌체가 아니라 `createMergedLadders()`에서 같은 x축 타일을 긴 감지 영역으로 병합합니다. 사다리 꼭대기 점프/아래쪽 진입 판정이 흔들리면 병합 영역의 `top`, `bottom`, `centerX` 값을 먼저 확인하세요.
- 몬스터는 `hazards` 그룹의 동적 body이며 `minX`, `maxX`, `speed`, `direction` data 값을 기준으로 순찰합니다. 타일 충돌 범위를 바꾸면 몬스터가 떨어지거나 벽에 박힐 수 있으니 `updateHazards()` 리스폰 조건도 같이 확인하세요.

### 데이터/배포 주의사항
- 이력 문구와 챕터 순서는 `portfolioTimeline`이 원본입니다. 챕터를 추가하면 `getSegmentLayout()` profile 반복, 수집 skill index, contact 링크 팝업 노출까지 함께 점검하세요.
- GitHub Pages 배포는 `npm run build`로 만든 `dist/` 정적 파일을 `gh-pages` 브랜치에 반영하는 흐름입니다. Vite base path나 privacy policy 경로를 바꾸면 실제 Pages URL에서 새로고침 진입도 확인하세요.
- 빠른 검증은 `npm run typecheck`, `npm run lint`, `npm run build` 순서가 좋습니다. Phaser 화면/모바일 조작 변경이 있으면 브라우저에서 데스크톱과 모바일 폭을 모두 확인하세요.
이 프로젝트는 React UI 위에 Phaser 게임 레이어를 얹은 포트폴리오입니다.
수작업으로 수정할 때는 먼저 데이터, UI, 게임 물리를 분리해서 생각하면 훨씬 덜 꼬입니다.

## 자주 쓰는 명령어

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

- `npm run dev`: 로컬 개발 서버 실행
- `npm run typecheck`: TypeScript 타입 검증
- `npm run lint`: ESLint 검증
- `npm run build`: 배포용 `dist/` 생성

## 파일별 역할

- `src/data/portfolioTimeline.ts`: 이력/챕터/스킬/링크 데이터
- `src/App.tsx`: 언어 전환, 게임 모드/이력서 모드 전환, 팝업 상태 관리
- `src/components/Hud.tsx`: 상단 HUD, EN/KO 버튼, 이력서 버튼, 보유 기술 표시
- `src/components/PortfolioPopup.tsx`: ! 블록을 치면 열리는 이력 팝업
- `src/components/RecruiterMode.tsx`: 게임 없이 스크롤로 보는 이력서 모드
- `src/game/PhaserGame.tsx`: React 안에서 Phaser 인스턴스를 만들고 크기 반응 처리
- `src/game/PortfolioScene.ts`: 실제 게임 월드, 이동, 점프, 사다리, 몬스터, 충돌, 아이템 수집
- `src/game/gameEvents.ts`: React와 Phaser를 이어주는 이벤트 버스
- `src/game/assetManifest.ts`: Kenney 이미지 파일을 사람이 읽기 쉬운 키로 매핑
- `src/game/kenneySampleMaps.ts`: Kenney 샘플 TMX 맵을 코드 데이터로 변환한 파일
- `src/styles.css`: 전체 UI, HUD, 팝업, 모바일 조작 버튼 스타일

## 수정 순서 추천

1. 먼저 `git status --short`로 기존 변경 파일을 확인합니다.
2. 이력 문구나 링크는 `src/data/portfolioTimeline.ts`에서 수정합니다.
3. 화면 문구나 버튼 배치는 `components`와 `styles.css`에서 수정합니다.
4. 게임 동작은 `src/game/PortfolioScene.ts`에서 수정합니다.
5. 수정 후 `npm run typecheck`, `npm run lint`, `npm run build` 순서로 확인합니다.
6. 브라우저에서 모바일 폭과 데스크톱 폭을 둘 다 확인합니다.

## 언어 전환 구조

- `App.tsx`가 현재 언어 상태를 `locale`로 들고 있습니다.
- `Hud.tsx`의 `EN/KO` 버튼을 누르면 `locale`이 바뀝니다.
- React UI는 `isKorean` 값으로 한글/영문을 골라 보여줍니다.
- Phaser 내부 문구는 `gameEvents.emitLanguageChange(locale)` 이벤트로 전달됩니다.
- 게임 안에서 뜨는 짧은 문구는 `PortfolioScene.ts`의 `this.locale`을 기준으로 표시됩니다.

## 이력 데이터 수정

`portfolioTimeline` 배열 하나가 게임의 시간순 챕터입니다.

```ts
{
  id: 'contact',
  year: 'Contact',
  title: 'Contact chapter',
  subtitle: 'Recruiter-friendly summary',
  chapterTheme: 'contact',
  summary: '...',
  details: ['...'],
  skills: ['Jenkins', 'Jira'],
  ko: {
    title: '연락 및 지원 요약',
    subtitle: '채용 담당자를 위한 정리',
    summary: '...',
    details: ['...']
  }
}
```

- `title`, `summary`, `details`: 영문 기본 문구
- `ko`: 한글 번역 문구
- `skills`: 게임에서 수집되는 기술 스택
- `chapterTheme`: 배경/몬스터 분위기에 쓰는 분류

사이드프로젝트나 GitHub 링크는 `profile.links`에 추가합니다.

## 게임 물리 수정 포인트

`src/game/PortfolioScene.ts`에서 가장 많이 만지는 곳은 아래입니다.

- `spawnPoint`: 처음 시작 위치
- `lastSafePosition`: 떨어졌을 때 돌아갈 안전 위치
- `getSegmentLayout(index)`: 챕터별 ! 블록, 몬스터 배치 기준
- `createSamplePhysics(...)`: 샘플맵 타일을 실제 충돌/사다리/아이템/스프링으로 바꾸는 곳
- `isWalkableFrame(frame)`: 밟을 수 있는 타일 프레임 목록
- `isLadderFrame(frame)`: 사다리 타일 프레임 목록
- `drawPortfolioHazard(...)`: 몬스터 생성 위치와 순찰 범위
- `updateHazards()`: 몬스터 이동, 방향 전환, 낙하 복구
- `respawnPlayer()`: 플레이어 낙하 후 복귀 처리

## 타일 프레임 수정 방법

Kenney `tilemap_packed.png`는 18px 타일 시트입니다.
`PortfolioScene.ts`에서는 타일 번호를 `frame` 값으로 다룹니다.

- 초록/모래/눈 바닥만 밟히게 하려면 `isWalkableFrame(frame)` 범위를 좁힙니다.
- 장식이 바닥처럼 걸리면 그 frame을 `isWalkableFrame`에서 제거합니다.
- 구름이나 나무 가지를 밟게 하려면 해당 frame을 `isWalkableFrame`에 추가합니다.
- 아이템은 `isSampleCollectibleFrame(frame)`에 들어가면 먹을 수 있게 됩니다.
- 스프링은 `isSpringFrame(frame)`에 들어가면 점프 부스트가 됩니다.

타일 번호가 헷갈리면 `public/assets/kenney/pixel-platformer/Tilemap/tilemap_packed.png`를 열고, 왼쪽 위부터 0번으로 세면 됩니다.

## 사다리 작업 규칙

사다리는 개별 타일이 아니라 이어진 세로 줄을 하나의 감지 영역으로 합칩니다.

- `createMergedLadders(...)`: 같은 x좌표의 사다리 타일을 묶습니다.
- `getActiveLadderInfo()`: 플레이어가 현재 겹치는 사다리의 top/bottom/centerX를 찾습니다.
- `isAtLadderTop(...)`: 사다리 맨 위에서 점프할 수 있는지 판단합니다.
- `isAtLadderBottom(...)`: 사다리 맨 아래에서 더 내려가지 않게 판단합니다.

수정할 때 목표는 이 흐름입니다.

1. 사다리 아래 바닥에서는 정상적으로 서 있습니다.
2. 위키/점프키를 누르면 사다리 감지 영역으로 진입합니다.
3. 사다리 위까지 올라가면 윗 타일에 올라선 상태가 됩니다.
4. 그 상태에서 점프키를 누르면 일반 점프가 됩니다.

## 몬스터 작업 규칙

몬스터는 `hazards` 물리 그룹에 들어갑니다.

- `drawPortfolioHazard(...)`에서 몬스터를 만듭니다.
- `minX`, `maxX`, `speed`, `direction` 데이터로 순찰 범위를 정합니다.
- `this.physics.add.collider(hazards, solids)`로 바닥과 충돌합니다.
- `updateHazards()`에서 좌우 이동과 방향 전환을 처리합니다.

몬스터가 땅에 박히면 y좌표를 조금 올리거나 `setSize`, `setOffset`을 조정합니다.
몬스터가 바닥을 뚫고 떨어지면 해당 바닥 타일 frame이 `isWalkableFrame`에 들어 있는지 확인합니다.

## 배포 메모

현재 GitHub Pages는 `gh-pages` 브랜치의 정적 파일을 봅니다.
수동 배포 흐름은 다음과 같습니다.

1. `npm run build`
2. `dist/` 내용을 `gh-pages` 브랜치 루트로 복사
3. `.nojekyll` 포함 확인
4. `gh-pages` 브랜치 커밋/푸시

일반 코드 변경은 `main` 브랜치에 커밋합니다.
