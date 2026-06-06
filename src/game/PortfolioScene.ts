import Phaser from 'phaser';
import { portfolioTimeline } from '../data/portfolioTimeline';
import { assetManifest } from './assetManifest';
import { gameEvents } from './gameEvents';
import { kenneySampleMaps, type KenneySampleMap } from './kenneySampleMaps';

type Theme = {
  sky: number;
  haze: number;
  accent: number;
  water: number;
};

type SegmentLayout = {
  startX: number;
  centerX: number;
  blockX: number;
  blockY: number;
  ledgeX: number;
  ledgeY: number;
  coins: Array<{ x: number; y: number; skillIndex: number }>;
  hazardX: number;
  hazardY: number;
};

type LadderInfo = {
  top: number;
  bottom: number;
  centerX: number;
};

const segmentWidth = 540;
const viewHeight = 640;
const sampleScale = 2;
const sampleChunkWidth = kenneySampleMaps.sampleA.width * kenneySampleMaps.sampleA.tileWidth * sampleScale;
const timelineWorldWidth = 280 + portfolioTimeline.length * segmentWidth;
const worldWidth = Math.ceil(timelineWorldWidth / sampleChunkWidth) * sampleChunkWidth;
const baseBackdrop = { sky: 0xd9f2f1, haze: 0xffffff, water: 0x69c8dd };
const spawnPoint = { x: 126, y: 250 };

const themes: Record<string, Theme> = {
  campus: { sky: 0xd9f2f1, haze: 0xffffff, accent: 0x58a65c, water: 0x69c8dd },
  office: { sky: 0xd8ecf5, haze: 0xf3f7ff, accent: 0x146c94, water: 0x6bb1cf },
  australia: { sky: 0xf6dfbd, haze: 0xfff3d2, accent: 0xe7a94b, water: 0x3fb8d4 },
  lab: { sky: 0xd8f1ee, haze: 0xeffff7, accent: 0x58a65c, water: 0x56c2ba },
  modern: { sky: 0xdce4f7, haze: 0xf7f7ff, accent: 0x628ed7, water: 0x628ed7 },
  contact: { sky: 0xf4edf7, haze: 0xffffff, accent: 0xe4572e, water: 0x7ec9df }
};

export class PortfolioScene extends Phaser.Scene {
  // 포트폴리오 월드의 모든 플레이 상태는 이 씬이 소유하고, UI 전달만 gameEvents로 넘깁니다.
  private chapterIndex = 0;
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<'left' | 'right' | 'jump', Phaser.Input.Keyboard.Key>;
  private moveLeft = false;
  private moveRight = false;
  private jumpHeld = false;
  private jumpQueuedAt = -Infinity;
  private lastGroundedAt = 0;
  private wasGrounded = false;
  private viewedIds = new Set<string>();
  private skills = new Set<string>();
  private milestoneOpen = false;
  private justOpenedAt = 0;
  private lastHazardHitAt = -Infinity;
  private squashUntil = 0;
  private shadow?: Phaser.GameObjects.Ellipse;
  private renderedSampleChunks = new Set<number>();
  private physicsSampleChunks = new Set<number>();
  private sampleCollectibleVisuals = new Map<string, Phaser.GameObjects.Image>();
  private ladders?: Phaser.Physics.Arcade.StaticGroup;
  private isClimbing = false;
  private lastSpringAt = -Infinity;
  private lastSafePosition = { ...spawnPoint };
  private locale: 'en' | 'ko' = navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
  private hazards?: Phaser.Physics.Arcade.Group;

  constructor() {
    super('PortfolioScene');
  }

  preload() {
    // assetManifest의 논리 키를 Phaser texture key로 변환해 이후 월드 생성 코드가 경로를 몰라도 되게 합니다.
    Object.entries(assetManifest.tiles).forEach(([key, path]) => this.load.image(`tile:${key}`, path));
    Object.entries(assetManifest.characters).forEach(([key, path]) => this.load.image(`char:${key}`, path));
    Object.entries(assetManifest.backgrounds).forEach(([key, path]) => this.load.image(`bg:${key}`, path));
    this.load.spritesheet('tilemap:tiles', `${assetManifest.base}/Tilemap/tilemap_packed.png`, {
      frameWidth: 18,
      frameHeight: 18
    });
  }

  create() {
    // 키보드와 모바일 터치 입력을 같은 이동 플래그로 합쳐 update 루프에서 동일하게 처리합니다.
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W
    }) as Record<'left' | 'right' | 'jump', Phaser.Input.Keyboard.Key>;

    this.input.keyboard?.on('keydown-SPACE', () => this.jump());
    this.input.keyboard?.on('keydown-UP', () => this.jump());
    this.input.keyboard?.on('keydown-W', () => this.jump());

    this.physics.world.gravity.y = 1120;
    this.physics.world.setBounds(0, 0, worldWidth, viewHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, viewHeight);
    this.cameras.main.setBackgroundColor(themes.campus.sky);
    this.cameras.main.setDeadzone(92, 90);
    this.cameras.main.setFollowOffset(-28, 0);

    this.buildTimelineWorld();

    gameEvents.addEventListener('resume-game', this.resumeFromPopup);
    gameEvents.addEventListener('language-change', this.handleLanguageChange as EventListener);
    window.addEventListener('touch-control', this.handleTouchControl as EventListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupListeners());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupListeners());
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors || !this.keys) return;
    this.cameras.main.scrollY = 0;
    // 프레임 시간이 튀어도 물리 이동이 과하게 점프하지 않도록 dt 상한을 둡니다.
    const left = this.cursors.left.isDown || this.keys.left.isDown || this.moveLeft;
    const right = this.cursors.right.isDown || this.keys.right.isDown || this.moveRight;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const dt = Math.min(delta / 1000, 0.033);
    const grounded = body.blocked.down || body.touching.down;
    const activeLadder = this.getActiveLadderInfo();
    const onLadder = !!activeLadder;
    const ladderTopJumpable = this.isAtLadderTop(activeLadder);
    const ladderLocksPlayer = onLadder && !ladderTopJumpable;
    const climbUp = ladderLocksPlayer && (this.cursors.up.isDown || this.keys.jump.isDown || this.jumpHeld);
    const climbDown = onLadder && this.cursors.down.isDown;
    this.isClimbing = climbUp || climbDown;

    // 사다리 위에서는 중력을 꺼서 미끄러짐을 막고, 꼭대기에 도달하면 다시 일반 점프/낙하 물리로 넘깁니다.
    // top/bottom 임계값을 바꾸면 아래 isAtLadderTop/isAtLadderBottom 판정과 함께 조정해야 합니다.
    if (left) {
      this.player.setVelocityX(Math.max(body.velocity.x - 1550 * dt, -250));
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(Math.min(body.velocity.x + 1550 * dt, 250));
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(Phaser.Math.Linear(body.velocity.x, 0, grounded ? 0.22 : 0.08));
      if (Math.abs(body.velocity.x) < 8) this.player.setVelocityX(0);
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, 18, worldWidth - 18);

    body.allowGravity = !ladderLocksPlayer;
    if (ladderLocksPlayer) {
      if (climbUp) {
        if (activeLadder && body.bottom <= activeLadder.top + 26) {
          this.player.setPosition(activeLadder.centerX, activeLadder.top - 26);
          this.player.setVelocityY(0);
          this.lastGroundedAt = time;
        } else {
          this.player.setVelocityY(-135);
        }
        this.jumpQueuedAt = -Infinity;
      } else if (climbDown) {
        this.player.setVelocityY(this.isAtLadderBottom(activeLadder) ? 0 : 120);
      } else {
        this.player.setVelocityY(0);
      }
    }

    if (grounded) this.lastGroundedAt = time;
    if (!ladderLocksPlayer) {
      if (this.jumpHeld && time - this.jumpQueuedAt > 260) this.jumpQueuedAt = time;
      if (time - this.jumpQueuedAt < 180 && time - this.lastGroundedAt < 130) this.performJump();
      if (!grounded && body.velocity.y < -80 && !this.jumpHeld) this.player.setVelocityY(body.velocity.y * 0.94);
    }

    if (grounded && this.player.y < 590) {
      this.lastSafePosition = { x: this.player.x, y: Math.max(80, this.player.y - 84) };
    }

    if (this.player.y > viewHeight + 80) this.respawnPlayer();

    this.updateHazards();
    this.updateCurrentMilestone();
    this.animatePlayer(time, grounded, left, right);
    this.wasGrounded = grounded;
  }

  private isPlayerOnLadder() {
    return !!this.getActiveLadderInfo();
  }

  private getActiveLadderInfo(): LadderInfo | null {
    if (!this.player || !this.ladders) return null;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const playerRect = new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height);
    const ladders = this.ladders.getChildren()
      .map((ladder) => {
        const ladderBody = (ladder as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody;
        const ladderRect = new Phaser.Geom.Rectangle(ladderBody.x, ladderBody.y, ladderBody.width, ladderBody.height);
        return { ladder, ladderBody, ladderRect };
      })
      .filter(({ ladderBody, ladderRect }) => {
        const centerInsideLadder = playerBody.center.x >= ladderBody.left - 4 && playerBody.center.x <= ladderBody.right + 4;
        return centerInsideLadder && Phaser.Geom.Intersects.RectangleToRectangle(playerRect, ladderRect);
      })
      .sort((a, b) => Math.abs(a.ladderBody.center.x - playerBody.center.x) - Math.abs(b.ladderBody.center.x - playerBody.center.x));

    const active = ladders[0];
    if (!active) return null;
    const ladderObject = active.ladder as Phaser.Physics.Arcade.Image;
    return {
      top: (ladderObject.getData('top') as number | undefined) ?? active.ladderBody.top,
      bottom: (ladderObject.getData('bottom') as number | undefined) ?? active.ladderBody.bottom,
      centerX: active.ladderBody.center.x
    };
  }

  private isAtLadderTop(ladderInfo = this.getActiveLadderInfo()) {
    if (!this.player || !ladderInfo) return false;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    return playerBody.bottom <= ladderInfo.top + 20;
  }

  private isAtLadderBottom(ladderInfo = this.getActiveLadderInfo()) {
    if (!this.player || !ladderInfo) return false;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    return playerBody.bottom >= ladderInfo.bottom - 12;
  }

  private handleTouchControl = (event: Event) => {
    const detail = (event as CustomEvent<{ control: string; pressed: boolean }>).detail;
    // React 터치 버튼의 pressed 상태를 프레임별 이동 플래그로 보관합니다.
    this.moveLeft = detail.control === 'left' ? detail.pressed : this.moveLeft;
    this.moveRight = detail.control === 'right' ? detail.pressed : this.moveRight;
    this.jumpHeld = detail.control === 'jump' ? detail.pressed : this.jumpHeld;
    if (detail.control === 'jump' && detail.pressed) this.jumpQueuedAt = this.time.now;
  };

  private jump() {
    if (this.isPlayerOnLadder() && !this.isAtLadderTop()) return;
    this.jumpQueuedAt = this.time.now;
  }

  private performJump() {
    if (!this.player) return;
    this.player.setVelocityY(-900);
    this.jumpQueuedAt = -Infinity;
    this.squashUntil = this.time.now + 120;
    this.addJumpPuff(this.player.x, this.player.y + 30);
  }

  private buildTimelineWorld() {
    // 타임라인 데이터 1개가 게임 월드의 한 구간이 됩니다. 구간별 배경/발판/수집품/팝업 블록을 생성합니다.
    this.physics.world.colliders.destroy();
    this.children.removeAll();
    this.renderedSampleChunks.clear();
    this.physicsSampleChunks.clear();
    this.sampleCollectibleVisuals.clear();

    const solids = this.physics.add.staticGroup();
    const ladders = this.physics.add.staticGroup();
    const springs = this.physics.add.staticGroup();
    const collectibles = this.physics.add.staticGroup();
    const hazards = this.physics.add.group({
      allowGravity: true,
      collideWorldBounds: false
    });
    const blocks = this.physics.add.staticGroup();
    this.ladders = ladders;
    this.hazards = hazards;
    this.lastSafePosition = { ...spawnPoint };

    portfolioTimeline.forEach((milestone, index) => {
      const layout = this.getSegmentLayout(index);
      const theme = themes[milestone.chapterTheme];
      const sampleMap = this.getSampleMapForLayout(layout);
      this.drawSegmentBackground(theme, milestone.chapterTheme, layout);
      this.createSamplePhysics(solids, ladders, springs, collectibles, layout, sampleMap);
      this.createSampleMilestoneBlock(blocks, layout, sampleMap, index);
      this.drawPortfolioHazard(milestone.chapterTheme, layout, hazards);
    });

    for (let chunkIndex = 0; chunkIndex < Math.ceil(worldWidth / sampleChunkWidth); chunkIndex += 1) {
      const layout = this.getSampleChunkLayout(chunkIndex);
      const sampleMap = this.getSampleMapForLayout(layout);
      this.drawKenneySampleChunk(layout, sampleMap);
      this.createSamplePhysics(solids, ladders, springs, collectibles, layout, sampleMap);
    }

    this.shadow = this.add.ellipse(spawnPoint.x, 316, 42, 12, 0x25313a, 0.22).setDepth(8);
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'char:player').setScale(2.25).setDepth(10);
    this.player.setSize(17, 21);
    this.player.setOffset(3, 2);
    this.player.setCollideWorldBounds(false);
    this.cameras.main.startFollow(this.player, true, 0.12, 0);
    this.cameras.main.scrollX = 0;

    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(hazards, solids);
    this.physics.add.collider(this.player, blocks, this.tryOpenMilestone, undefined, this);
    this.physics.add.overlap(this.player, collectibles, this.collectSkillItem, undefined, this);
    this.physics.add.overlap(this.player, hazards, this.hitHazard, undefined, this);
    this.physics.add.overlap(this.player, springs, this.hitSpring, undefined, this);

    this.chapterIndex = 0;
    gameEvents.emitChapter(0);
    this.emitSkills();
  }

  private getSampleMapForLayout(layout: SegmentLayout) {
    const chunkIndex = this.getSampleChunkIndex(layout.startX);
    const chunkStart = chunkIndex * sampleChunkWidth;
    const chunkEnd = chunkStart + sampleChunkWidth;
    const hasAustraliaMilestone = portfolioTimeline.some((milestone, index) => {
      if (milestone.chapterTheme !== 'australia') return false;
      const segmentStart = index * segmentWidth;
      const segmentEnd = segmentStart + segmentWidth;
      return segmentStart < chunkEnd && segmentEnd > chunkStart;
    });
    return hasAustraliaMilestone ? kenneySampleMaps.sampleB : kenneySampleMaps.sampleA;
  }

  private getSampleChunkIndex(worldX: number) {
    return Math.floor(worldX / sampleChunkWidth);
  }

  private getSegmentLayout(index: number): SegmentLayout {
    // 수작업 포인트:
    // 챕터별 ! 블록 기준 위치와 몬스터 배치 기준을 바꾸고 싶으면 이 profiles 값을 먼저 조정하세요.
    // 실제 샘플맵 이미지는 반복 렌더링되지만, milestone block과 hazard는 이 layout 좌표를 기준으로 붙습니다.
    const startX = index * segmentWidth;
    const centerX = startX + 270;
    const profiles = [
      { block: 318, ledgeX: -106, ledgeY: 410, hazardX: 304, hazardY: 462, coins: [[176, 330], [238, 330], [330, 286]] },
      { block: 296, ledgeX: -134, ledgeY: 396, hazardX: 318, hazardY: 456, coins: [[132, 320], [214, 306], [306, 334]] },
      { block: 340, ledgeX: -88, ledgeY: 424, hazardX: 286, hazardY: 462, coins: [[154, 348], [240, 326], [352, 348]] },
      { block: 308, ledgeX: -150, ledgeY: 408, hazardX: 338, hazardY: 462, coins: [[170, 322], [256, 300], [342, 322]] },
      { block: 328, ledgeX: -96, ledgeY: 388, hazardX: 300, hazardY: 462, coins: [[138, 340], [228, 316], [320, 292]] },
      { block: 300, ledgeX: -118, ledgeY: 420, hazardX: 342, hazardY: 456, coins: [[156, 334], [244, 308], [332, 334]] },
      { block: 316, ledgeX: -146, ledgeY: 398, hazardX: 292, hazardY: 462, coins: [[146, 328], [226, 348], [318, 318]] },
      { block: 336, ledgeX: -82, ledgeY: 414, hazardX: 320, hazardY: 462, coins: [[164, 346], [250, 324], [356, 304]] },
      { block: 304, ledgeX: -126, ledgeY: 404, hazardX: 306, hazardY: 462, coins: [[146, 326], [238, 300], [338, 326]] }
    ] as const;
    const profile = profiles[index] ?? profiles[index % profiles.length];
    return {
      startX,
      centerX,
      blockX: centerX + 72,
      blockY: profile.block,
      ledgeX: centerX + profile.ledgeX,
      ledgeY: profile.ledgeY,
      coins: profile.coins.map(([x, y], skillIndex) => ({ x: centerX + x, y, skillIndex })),
      hazardX: centerX + profile.hazardX,
      hazardY: profile.hazardY
    };
  }

  private getSampleChunkLayout(chunkIndex: number): SegmentLayout {
    const startX = chunkIndex * sampleChunkWidth;
    return {
      startX,
      centerX: startX + sampleChunkWidth / 2,
      blockX: startX + sampleChunkWidth / 2,
      blockY: 0,
      ledgeX: startX,
      ledgeY: 0,
      coins: [],
      hazardX: startX,
      hazardY: 0
    };
  }

  private drawSegmentBackground(theme: Theme, name: string, layout: SegmentLayout) {
    const isAustralia = name === 'australia';
    const sky = isAustralia ? theme.sky : baseBackdrop.sky;

    this.add.rectangle(layout.centerX, 320, segmentWidth, 640, sky).setDepth(-20);

    this.drawKenneySampleChunk(layout, this.getSampleMapForLayout(layout));
  }

  private drawKenneySampleChunk(layout: SegmentLayout, sampleMap: KenneySampleMap) {
    const chunkIndex = this.getSampleChunkIndex(layout.startX);
    if (this.renderedSampleChunks.has(chunkIndex)) return;
    this.renderedSampleChunks.add(chunkIndex);

    const scale = sampleScale;
    const originX = chunkIndex * sampleChunkWidth + 18;
    const originY = 10;

    sampleMap.layers.forEach((layer, layerIndex) => {
      layer.tiles.forEach((frame, tileIndex) => {
        if (frame < 0) return;
        const col = tileIndex % sampleMap.width;
        const row = Math.floor(tileIndex / sampleMap.width);
        if (this.shouldHideSampleFrame(frame, col, row)) return;
        const image = this.add
          .image(originX + col * sampleMap.tileWidth * scale, originY + row * sampleMap.tileHeight * scale, 'tilemap:tiles', frame)
          .setOrigin(0, 0)
          .setScale(scale)
          .setDepth(-9 + layerIndex);
        if (this.isSampleCollectibleFrame(frame)) {
          this.sampleCollectibleVisuals.set(this.getSampleTileKey(chunkIndex, layerIndex, col, row, frame), image.setDepth(3));
        }
      });
    });

    this.drawSampleVisualFixups(sampleMap, originX, originY, sampleMap.tileWidth * scale);
  }

  private shouldHideSampleFrame(frame: number, col: number, row: number) {
    // 샘플맵 왼쪽 천장 아래에 떠 있는 새싹 장식은 사용자가 직접 표시한 어색한 구간이라 렌더링하지 않습니다.
    return (frame === 124 || frame === 125) && col <= 2 && row <= 7;
  }

  private drawSampleVisualFixups(sampleMap: KenneySampleMap, originX: number, originY: number, tileSize: number) {
    if (sampleMap !== kenneySampleMaps.sampleA) return;

    // 샘플 A의 중앙 나무 가지가 중간에 비어 보이는 부분만 얇은 픽셀 라인으로 보강합니다.
    // 큰 타일을 얹으면 과하게 뭉개져 보여서, 장식용 rectangle만 사용하고 물리는 부여하지 않습니다.
    this.add.rectangle(originX + 14.9 * tileSize, originY + 8.42 * tileSize, tileSize * 1.3, 5, 0x8a5a44).setDepth(-4);
    this.add.rectangle(originX + 14.25 * tileSize, originY + 8.2 * tileSize, tileSize * 0.75, 5, 0x8a5a44).setDepth(-4);
  }

  private createSamplePhysics(
    solids: Phaser.Physics.Arcade.StaticGroup,
    ladders: Phaser.Physics.Arcade.StaticGroup,
    springs: Phaser.Physics.Arcade.StaticGroup,
    collectibles: Phaser.Physics.Arcade.StaticGroup,
    layout: SegmentLayout,
    sampleMap: KenneySampleMap
  ) {
    // Kenney 샘플 타일맵에서 1x1 타일 단위의 충돌/아이템/사다리/스프링을 생성합니다.
    // 화면에 보이는 타일과 물리 충돌체는 별개입니다.
    // 특정 장식이 밟히거나, 밟아야 할 타일이 통과되면 아래 isWalkableFrame/isLadderFrame 계열을 먼저 확인하세요.
    const chunkIndex = this.getSampleChunkIndex(layout.startX);
    if (this.physicsSampleChunks.has(chunkIndex)) return;
    this.physicsSampleChunks.add(chunkIndex);

    const scale = sampleScale;
    const tileSize = sampleMap.tileWidth * scale;
    const originX = chunkIndex * sampleChunkWidth + 18;
    const originY = 10;
    const ladderTiles: Array<{ x: number; y: number }> = [];

    sampleMap.layers.forEach((layer, layerIndex) => {
      layer.tiles.forEach((frame, tileIndex) => {
        if (frame < 0) return;
        const col = tileIndex % sampleMap.width;
        const row = Math.floor(tileIndex / sampleMap.width);
        const x = originX + col * tileSize;
        const y = originY + row * tileSize;

        if (this.isSampleCollectibleFrame(frame)) {
          const item = collectibles.create(x + tileSize / 2, y + tileSize / 2, 'tile:block') as Phaser.Physics.Arcade.Image;
          item
            .setDisplaySize(tileSize * 0.72, tileSize * 0.72)
            .setVisible(false)
            .setData('kind', this.getSampleCollectibleKind(frame))
            .setData('milestoneIndex', this.getMilestoneIndexForWorldX(x))
            .setData('skillIndex', this.getSkillIndexForSampleCollectible(frame, col, row))
            .setData('visualKey', this.getSampleTileKey(chunkIndex, layerIndex, col, row, frame))
            .refreshBody();
          return;
        }

        if (this.isSpringFrame(frame)) {
          const spring = springs.create(x + tileSize / 2, y + tileSize / 2, 'tile:block') as Phaser.Physics.Arcade.Image;
          spring.setDisplaySize(tileSize * 0.9, tileSize * 0.55).setVisible(false).refreshBody();
          return;
        }

        if (this.isLadderFrame(frame)) {
          ladderTiles.push({ x, y });
          return;
        }

        if (!this.isWalkableFrame(frame) || this.hasWalkableAbove(sampleMap, col, row)) return;

        const platform = solids.create(x + tileSize / 2, y + 6, 'tile:block') as Phaser.Physics.Arcade.Image;
        platform.setDisplaySize(tileSize * 0.78, 9).setVisible(false).refreshBody();
        const body = platform.body as Phaser.Physics.Arcade.StaticBody;
        body.checkCollision.down = false;
        body.checkCollision.left = false;
        body.checkCollision.right = false;
      });
    });

    this.createMergedLadders(ladders, ladderTiles, tileSize);
  }

  private createMergedLadders(
    ladders: Phaser.Physics.Arcade.StaticGroup,
    ladderTiles: Array<{ x: number; y: number }>,
    tileSize: number
  ) {
    // 사다리 감지는 개별 타일마다 만들면 맨 위/맨 아래 판정이 흔들립니다.
    // 같은 x좌표의 사다리 타일을 하나의 긴 감지 영역으로 합쳐서 안정적으로 오르내리게 합니다.
    const byColumn = new Map<number, number[]>();
    ladderTiles.forEach(({ x, y }) => {
      const key = Math.round(x);
      byColumn.set(key, [...(byColumn.get(key) ?? []), y]);
    });

    byColumn.forEach((ys, x) => {
      const sorted = [...new Set(ys.map((y) => Math.round(y)))].sort((a, b) => a - b);
      let runStart = sorted[0];
      let previous = sorted[0];

      const createRun = (start: number, end: number) => {
        const height = end - start + tileSize;
        const ladder = ladders.create(x + tileSize / 2, start + height / 2, 'tile:block') as Phaser.Physics.Arcade.Image;
        ladder
          .setDisplaySize(tileSize * 0.78, height + tileSize * 0.55)
          .setVisible(false)
          .setData('top', start)
          .setData('bottom', end + tileSize)
          .refreshBody();
      };

      sorted.slice(1).forEach((y) => {
        if (y - previous > tileSize * 1.2) {
          createRun(runStart, previous);
          runStart = y;
        }
        previous = y;
      });
      if (sorted.length) createRun(runStart, previous);
    });
  }

  private createSampleMilestoneBlock(
    blocks: Phaser.Physics.Arcade.StaticGroup,
    layout: SegmentLayout,
    sampleMap: KenneySampleMap,
    milestoneIndex: number
  ) {
    // 샘플맵의 ! 블록 위치를 찾아 보이지 않는 Arcade 충돌체로 등록합니다.
    const blockPosition = this.findSampleFramePosition(layout, sampleMap, 10);
    if (!blockPosition) return;

    const block = blocks.create(blockPosition.x, blockPosition.y, 'tile:question') as Phaser.Physics.Arcade.Image;
    block.setDisplaySize(42, 42).setVisible(false).setData('milestoneIndex', milestoneIndex).refreshBody();
  }

  private findSampleFramePosition(layout: SegmentLayout, sampleMap: KenneySampleMap, frameToFind: number) {
    const chunkIndex = this.getSampleChunkIndex(layout.startX);
    const scale = sampleScale;
    const tileSize = sampleMap.tileWidth * scale;
    const originX = chunkIndex * sampleChunkWidth + 18;
    const originY = 10;
    const candidates: Array<{ x: number; y: number; distance: number }> = [];

    sampleMap.layers.forEach((layer) => {
      layer.tiles.forEach((frame, tileIndex) => {
        if (frame !== frameToFind) return;
        const col = tileIndex % sampleMap.width;
        const row = Math.floor(tileIndex / sampleMap.width);
        const x = originX + col * tileSize + tileSize / 2;
        const y = originY + row * tileSize + tileSize / 2;
        const inSegment = x >= layout.startX && x < layout.startX + segmentWidth;
        candidates.push({ x, y, distance: Math.abs(x - layout.blockX) + (inSegment ? 0 : segmentWidth) });
      });
    });

    return candidates.sort((a, b) => a.distance - b.distance)[0];
  }

  private hasWalkableAbove(sampleMap: KenneySampleMap, col: number, row: number) {
    if (row <= 0) return false;
    return sampleMap.layers.some((layer) => this.isWalkableFrame(layer.tiles[(row - 1) * sampleMap.width + col]));
  }

  private isWalkableFrame(frame: number) {
    // 밟을 수 있는 타일 frame만 아주 보수적으로 등록합니다.
    // 범위를 넓게 잡으면 문, 줄, 장식, 아이템까지 바닥처럼 인식될 수 있으니 한 번에 많이 추가하지 마세요.
    return (
      (frame >= 0 && frame <= 3) ||
      (frame >= 20 && frame <= 25) ||
      (frame >= 40 && frame <= 43) ||
      (frame >= 60 && frame <= 63) ||
      frame === 96 ||
      frame === 97 ||
      (frame >= 153 && frame <= 156)
    );
  }

  private isLadderFrame(frame: number) {
    return frame === 51 || frame === 71;
  }

  private isSpringFrame(frame: number) {
    return frame === 107 || frame === 108;
  }

  private isSampleCollectibleFrame(frame: number) {
    return frame === 27 || frame === 67 || frame === 151 || frame === 152;
  }

  private getSampleCollectibleKind(frame: number) {
    if (frame === 27) return 'key';
    if (frame === 67) return 'diamond';
    return 'coin';
  }

  private getSkillIndexForSampleCollectible(frame: number, col: number, row: number) {
    if (frame === 27) return 0;
    if (frame === 67) return 1;
    return (col + row) % 3;
  }

  private getMilestoneIndexForWorldX(x: number) {
    return Phaser.Math.Clamp(Math.floor((x + segmentWidth * 0.35) / segmentWidth), 0, portfolioTimeline.length - 1);
  }

  private getSampleTileKey(chunkIndex: number, layerIndex: number, col: number, row: number, frame: number) {
    return `${chunkIndex}:${layerIndex}:${col}:${row}:${frame}`;
  }

  private drawPortfolioHazard(
    theme: string,
    layout: SegmentLayout,
    hazards: Phaser.Physics.Arcade.Group
  ) {
    // 몬스터는 동적 물리 body입니다. minX/maxX 안에서 걷고, solids와 충돌하며 중력을 받습니다.
    // 박혀 보이면 hazardY를 올리거나 configureHazard의 setSize/setOffset을 조정하세요.
    const texture = theme === 'lab' ? 'char:robotA' : theme === 'australia' ? 'char:enemyB' : 'char:enemyA';
    const hazard = hazards.create(layout.hazardX, layout.hazardY - 70, texture) as Phaser.Physics.Arcade.Image;
    hazard
      .setData('minX', layout.centerX + 120)
      .setData('maxX', layout.centerX + 410)
      .setData('speed', theme === 'lab' ? 58 : 44)
      .setData('direction', -1);
    this.configureHazard(hazard, theme === 'lab' ? 2.4 : 2.2);
  }

  private configureHazard(hazard: Phaser.Physics.Arcade.Image, scale: number) {
    hazard.setScale(scale);
    hazard.setSize(12, 13);
    hazard.setOffset(4, 5);
    hazard.setVelocityX(-((hazard.getData('speed') as number | undefined) ?? 44));
    hazard.setBounce(0);
    hazard.setDepth(9);
    hazard.setCollideWorldBounds(false);
  }

  private updateHazards() {
    // 몬스터 순찰 루프입니다.
    // 각 몬스터는 data(minX, maxX, speed, direction)를 갖고 있고, 벽이나 범위 끝에서 방향을 바꿉니다.
    if (!this.hazards) return;
    this.hazards.getChildren().forEach((hazardObject) => {
      const hazard = hazardObject as Phaser.Physics.Arcade.Image;
      if (!hazard.active) return;
      const body = hazard.body as Phaser.Physics.Arcade.Body;
      const minX = (hazard.getData('minX') as number | undefined) ?? hazard.x - 80;
      const maxX = (hazard.getData('maxX') as number | undefined) ?? hazard.x + 80;
      const speed = (hazard.getData('speed') as number | undefined) ?? 44;
      let direction = (hazard.getData('direction') as number | undefined) ?? -1;

      if (hazard.x <= minX || body.blocked.left) direction = 1;
      if (hazard.x >= maxX || body.blocked.right) direction = -1;
      if (hazard.y > viewHeight + 80) {
        hazard.setPosition(Phaser.Math.Clamp(hazard.x, minX + 16, maxX - 16), 250);
        hazard.setVelocityY(0);
      }

      hazard.setData('direction', direction);
      hazard.setVelocityX(direction * speed);
      hazard.setFlipX(direction > 0);
    });
  }

  private tryOpenMilestone: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, blockObject) => {
    if (!this.player || this.milestoneOpen || this.scene.isPaused()) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 900) return;

    const block = blockObject as Phaser.Physics.Arcade.Image;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const blockBody = block.body as Phaser.Physics.Arcade.StaticBody;
    // 옆에서 스치면 열리지 않고, 플레이어 머리가 아래에서 블록을 친 경우에만 팝업을 엽니다.
    const horizontallyTouchingBlock = playerBody.right > blockBody.left + 4 && playerBody.left < blockBody.right - 4;
    const headReachedBlock = playerBody.top <= blockBody.bottom + 6;
    const playerIsBelowBlock = playerBody.center.y > blockBody.center.y + 10;
    const headHit = horizontallyTouchingBlock && headReachedBlock && playerIsBelowBlock && (playerBody.blocked.up || playerBody.touching.up || playerBody.velocity.y <= 0);

    if (!headHit) return;
    this.openMilestone(block);
  };

  private collectSkillItem: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, itemObject) => {
    const item = itemObject as Phaser.Physics.Arcade.Image;
    if (!item.active) return;

    const milestoneIndex = (item.getData('milestoneIndex') as number | undefined) ?? this.chapterIndex;
    const milestone = portfolioTimeline[milestoneIndex];
    const kind = item.getData('kind') as string | undefined;
    const skillIndex = (item.getData('skillIndex') as number | undefined) ?? 0;
    const skill = milestone.skills[skillIndex % milestone.skills.length];
    const visualKey = item.getData('visualKey') as string | undefined;
    const visual = visualKey ? this.sampleCollectibleVisuals.get(visualKey) : undefined;

    // 수집된 기술은 Set에 누적한 뒤 HUD에 다시 발행합니다.
    this.skills.add(skill);
    this.emitSkills();
    this.floatLabel(item.x, item.y - 18, kind === 'diamond' ? `${skill} + gem` : kind === 'key' ? `${skill} + key` : skill);
    visual?.destroy();
    if (visualKey) this.sampleCollectibleVisuals.delete(visualKey);
    item.destroy();
  };

  private hitSpring: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, springObject) => {
    if (!this.player || this.milestoneOpen || this.scene.isPaused()) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const springBody = (springObject as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.StaticBody;
    const now = this.time.now;
    if (now - this.lastSpringAt < 450 || body.velocity.y < -80) return;
    if (body.bottom > springBody.top + 18) return;
    this.lastSpringAt = now;
    this.player.setVelocityY(-900 * 2.5);
    this.squashUntil = now + 150;
    this.addJumpPuff(this.player.x, this.player.y + 30);
    this.floatLabel(this.player.x - 20, this.player.y - 52, this.locale === 'ko' ? '점프 부스트' : 'Jump boost');
  };

  private hitHazard: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (!this.player || this.milestoneOpen || this.scene.isPaused()) return;
    const now = this.time.now;
    if (now - this.lastHazardHitAt < 900) return;
    this.lastHazardHitAt = now;
    this.addJumpPuff(this.player.x, this.player.y + 24);
    this.floatLabel(this.player.x - 42, this.player.y - 42, this.hazardMessage());
    this.player.setVelocityY(Math.min(-180, (this.player.body as Phaser.Physics.Arcade.Body).velocity.y));
  };

  private hazardMessage() {
    return this.locale === 'ko' ? '장애물에 조심하세요' : 'Watch out for obstacles';
  }

  private respawnPlayer() {
    // 플레이어가 화면 아래로 떨어지면 마지막으로 저장한 안전 위치에서 다시 시작합니다.
    // 리스폰이 낮으면 update()의 lastSafePosition y 보정값을 더 키우세요.
    if (!this.player) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setPosition(this.lastSafePosition.x, this.lastSafePosition.y);
    this.player.setVelocity(0, 0);
    body.allowGravity = true;
    this.addJumpPuff(this.player.x, this.player.y + 30);
  }

  private openMilestone(block: Phaser.Physics.Arcade.Image) {
    if (this.milestoneOpen || this.scene.isPaused()) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 900) return;
    this.justOpenedAt = now;
    this.milestoneOpen = true;

    const milestoneIndex = (block.getData('milestoneIndex') as number | undefined) ?? this.chapterIndex;
    const milestone = portfolioTimeline[milestoneIndex];
    milestone.skills.forEach((skill) => this.skills.add(skill));
    this.viewedIds.add(milestone.id);
    block.setVisible(true).setTexture('tile:questionUsed');
    this.chapterIndex = milestoneIndex;
    // 팝업이 열리면 React가 표시를 맡고 Phaser 씬은 일시정지합니다.
    // React가 resume-game을 돌려보내기 전까지 물리 update가 멈추므로, 팝업 중 중복 충돌/중복 open을 피할 수 있습니다.
    this.emitSkills();
    gameEvents.emitChapter(milestoneIndex);
    gameEvents.emitMilestoneOpen({ milestone, index: milestoneIndex });
    this.scene.pause();
  }

  private updateCurrentMilestone() {
    if (!this.player) return;
    const index = Phaser.Math.Clamp(Math.floor((this.player.x + segmentWidth * 0.35) / segmentWidth), 0, portfolioTimeline.length - 1);
    if (index === this.chapterIndex) return;
    this.chapterIndex = index;
    gameEvents.emitChapter(index);
    this.emitSkills();
  }

  private animatePlayer(time: number, grounded: boolean, left: boolean, right: boolean) {
    if (!this.player) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.isClimbing) {
      this.player.setTexture(time % 260 < 130 ? 'char:playerWalkA' : 'char:playerWalkB');
      this.player.rotation = Math.PI;
      this.player.scaleX = 2.25;
      this.player.scaleY = 2.25;
      if (this.shadow) this.shadow.setScale(0.5, 1);
      return;
    }

    const lean = Phaser.Math.Clamp(body.velocity.x / 600, -0.18, 0.18);
    const airborneStretch = !grounded ? Phaser.Math.Clamp(-body.velocity.y / 1100, -0.08, 0.1) : 0;
    const landingSquash = time < this.squashUntil ? 0.1 : 0;

    if (left) this.player.setFlipX(true);
    if (right) this.player.setFlipX(false);

    if (!grounded) {
      this.player.setTexture('char:playerJump');
    } else if (Math.abs(body.velocity.x) > 32) {
      this.player.setTexture(time % 260 < 130 ? 'char:playerWalkA' : 'char:playerWalkB');
    } else {
      this.player.setTexture('char:player');
    }

    this.player.rotation = lean;
    this.player.scaleX = 2.25 + landingSquash - airborneStretch * 0.4;
    this.player.scaleY = 2.25 - landingSquash + airborneStretch;

    if (this.shadow) {
      this.shadow.setPosition(this.player.x, this.player.y + 40);
      const shadowScale = grounded ? 1 : Phaser.Math.Clamp(1 - Math.abs(this.player.y - spawnPoint.y) / 180, 0.42, 0.9);
      this.shadow.setScale(shadowScale, 1);
    }

    if (grounded && !this.wasGrounded) {
      this.squashUntil = time + 130;
      this.addJumpPuff(this.player.x, this.player.y + 30);
    }
  }

  private addJumpPuff(x: number, y: number) {
    for (let i = 0; i < 3; i += 1) {
      const puff = this.add.rectangle(x + (i - 1) * 10, y, 8, 4, 0xffffff, 0.65).setDepth(7);
      this.tweens.add({
        targets: puff,
        x: puff.x + (i - 1) * 14,
        y: puff.y + 8,
        alpha: 0,
        duration: 260,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy()
      });
    }
  }

  private floatLabel(x: number, y: number, text: string) {
    const label = this.add.text(x - 18, y, text, {
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: '900',
      color: '#2d2630',
      backgroundColor: '#fffbee'
    }).setDepth(20);

    this.tweens.add({
      targets: label,
      y: y - 26,
      alpha: 0,
      duration: 680,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy()
    });
  }

  private resumeFromPopup = () => {
    this.milestoneOpen = false;
    this.scene.resume();
  };

  private handleLanguageChange = (event: Event) => {
    this.locale = (event as CustomEvent<'en' | 'ko'>).detail;
  };

  private emitSkills() {
    gameEvents.emitSkills({
      skills: [...this.skills],
      chapterIndex: this.chapterIndex,
      viewedIds: [...this.viewedIds]
    });
  }

  private cleanupListeners() {
    gameEvents.removeEventListener('resume-game', this.resumeFromPopup);
    gameEvents.removeEventListener('language-change', this.handleLanguageChange as EventListener);
    window.removeEventListener('touch-control', this.handleTouchControl as EventListener);
  }

  destroy() {
    this.cleanupListeners();
  }
}

