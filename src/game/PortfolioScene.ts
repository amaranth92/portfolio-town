import Phaser from 'phaser';
import { portfolioTimeline } from '../data/portfolioTimeline';
import { assetManifest } from './assetManifest';
import { gameEvents } from './gameEvents';

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

const segmentWidth = 540;
const worldWidth = 280 + portfolioTimeline.length * segmentWidth;
const viewHeight = 640;

const themes: Record<string, Theme> = {
  campus: { sky: 0xd9f2f1, haze: 0xffffff, accent: 0x58a65c, water: 0x69c8dd },
  office: { sky: 0xd8ecf5, haze: 0xf3f7ff, accent: 0x146c94, water: 0x6bb1cf },
  australia: { sky: 0xf6dfbd, haze: 0xfff3d2, accent: 0xe7a94b, water: 0x3fb8d4 },
  lab: { sky: 0xd8f1ee, haze: 0xeffff7, accent: 0x58a65c, water: 0x56c2ba },
  modern: { sky: 0xdce4f7, haze: 0xf7f7ff, accent: 0x628ed7, water: 0x628ed7 },
  contact: { sky: 0xf4edf7, haze: 0xffffff, accent: 0xe4572e, water: 0x7ec9df }
};

export class PortfolioScene extends Phaser.Scene {
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

  constructor() {
    super('PortfolioScene');
  }

  preload() {
    Object.entries(assetManifest.tiles).forEach(([key, path]) => this.load.image(`tile:${key}`, path));
    Object.entries(assetManifest.characters).forEach(([key, path]) => this.load.image(`char:${key}`, path));
    Object.entries(assetManifest.backgrounds).forEach(([key, path]) => this.load.image(`bg:${key}`, path));
  }

  create() {
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
    window.addEventListener('touch-control', this.handleTouchControl as EventListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupListeners());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupListeners());
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors || !this.keys) return;
    const left = this.cursors.left.isDown || this.keys.left.isDown || this.moveLeft;
    const right = this.cursors.right.isDown || this.keys.right.isDown || this.moveRight;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const dt = Math.min(delta / 1000, 0.033);
    const grounded = body.blocked.down || body.touching.down;

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

    if (grounded) this.lastGroundedAt = time;
    if (this.jumpHeld && time - this.jumpQueuedAt > 260) this.jumpQueuedAt = time;
    if (time - this.jumpQueuedAt < 180 && time - this.lastGroundedAt < 130) this.performJump();
    if (!grounded && body.velocity.y < -80 && !this.jumpHeld) this.player.setVelocityY(body.velocity.y * 0.94);

    if (this.player.y > 620) {
      this.player.setPosition(Math.max(64, this.player.x - 120), 454);
      this.player.setVelocity(0, 0);
    }

    this.updateCurrentMilestone();
    this.animatePlayer(time, grounded, left, right);
    this.wasGrounded = grounded;
  }

  private handleTouchControl = (event: Event) => {
    const detail = (event as CustomEvent<{ control: string; pressed: boolean }>).detail;
    this.moveLeft = detail.control === 'left' ? detail.pressed : this.moveLeft;
    this.moveRight = detail.control === 'right' ? detail.pressed : this.moveRight;
    this.jumpHeld = detail.control === 'jump' ? detail.pressed : this.jumpHeld;
    if (detail.control === 'jump' && detail.pressed) this.jumpQueuedAt = this.time.now;
  };

  private jump() {
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
    this.physics.world.colliders.destroy();
    this.children.removeAll();

    const solids = this.physics.add.staticGroup();
    const platforms = this.physics.add.staticGroup();
    const collectibles = this.physics.add.staticGroup();
    const hazards = this.physics.add.staticGroup();
    const blocks = this.physics.add.staticGroup();

    portfolioTimeline.forEach((milestone, index) => {
      const layout = this.getSegmentLayout(index);
      const theme = themes[milestone.chapterTheme];
      this.drawSegmentBackground(theme, milestone.chapterTheme, layout, index);
      this.drawSegmentGround(solids, platforms, layout, index);
      this.drawSegmentDecor(milestone.chapterTheme, layout, collectibles, hazards, index);

      const block = blocks.create(layout.blockX, layout.blockY, 'tile:question') as Phaser.Physics.Arcade.Image;
      block.setScale(3).setSize(46, 46).setData('milestoneIndex', index).refreshBody();

      this.add.text(layout.startX + 22, 22, milestone.year, {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontStyle: '900',
        color: '#2d2630'
      });
      this.add.text(layout.startX + 22, 42, milestone.title, {
        fontFamily: 'Arial',
        fontSize: '14px',
        fontStyle: '900',
        color: '#2d2630',
        wordWrap: { width: 280 }
      });
    });

    this.shadow = this.add.ellipse(64, 492, 42, 12, 0x25313a, 0.22).setDepth(8);
    this.player = this.physics.add.sprite(64, 454, 'char:player').setScale(2.25).setDepth(10);
    this.player.setSize(17, 21);
    this.player.setOffset(3, 2);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.scrollX = 0;

    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(this.player, platforms, undefined, this.canLandOnPlatform, this);
    this.physics.add.collider(this.player, blocks, this.tryOpenMilestone, undefined, this);
    this.physics.add.overlap(this.player, collectibles, this.collectSkillItem, undefined, this);
    this.physics.add.overlap(this.player, hazards, this.hitHazard, undefined, this);

    this.chapterIndex = 0;
    gameEvents.emitChapter(0);
    this.emitSkills();
  }

  private getSegmentLayout(index: number): SegmentLayout {
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

  private drawSegmentBackground(theme: Theme, name: string, layout: SegmentLayout, index: number) {
    this.add.rectangle(layout.centerX, 320, segmentWidth, 640, theme.sky).setDepth(-20);
    this.add.rectangle(layout.centerX, 470, segmentWidth, 120, theme.haze, 0.38).setDepth(-15);
    this.add.rectangle(layout.centerX, 620, segmentWidth, 40, theme.water).setDepth(-12);
    this.add.rectangle(layout.startX + segmentWidth - 36, 460, 72, 72, theme.haze, 0.16).setDepth(-10);

    if (name === 'australia') {
      this.add.circle(layout.centerX + 150, 86, 30, 0xf6c453).setStrokeStyle(4, 0x2d2630);
      this.add.rectangle(layout.centerX - 80, 456, 220, 30, 0xfff3d2, 0.5);
      this.add.rectangle(layout.centerX + 180, 438, 220, 30, 0xfff3d2, 0.5);
      this.add.image(layout.centerX - 188, 462, 'tile:plantB').setScale(2.5);
      this.add.image(layout.centerX + 228, 462, 'tile:plantC').setScale(2.4);
      return;
    }

    if (name === 'office' || name === 'modern') {
      for (let i = 0; i < 5; i += 1) {
        this.add.rectangle(layout.startX + 54 + i * 96, 414 - (i % 2) * 24, 46, 160, theme.haze, 0.32);
      }
      this.add.image(layout.startX + segmentWidth - 70, 454, 'tile:pipeBody').setScale(2.4).setAlpha(0.72);
      return;
    }

    [layout.startX + 70, layout.startX + 320].forEach((x, cloudIndex) => {
      this.add.image(x, 122 + (cloudIndex % 2) * 34, 'tile:cloudLeft').setScale(3);
      this.add.image(x + 54, 122 + (cloudIndex % 2) * 34, 'tile:cloudMidA').setScale(3);
      this.add.image(x + 108, 122 + (cloudIndex % 2) * 34, 'tile:cloudRight').setScale(3);
    });

    if (index === 0) this.add.image(layout.startX + 252, 176, 'tile:cloudLeft').setScale(2.5);
  }

  private drawSegmentGround(
    solids: Phaser.Physics.Arcade.StaticGroup,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    layout: SegmentLayout,
    index: number
  ) {
    for (let x = layout.startX + 18; x < layout.startX + segmentWidth + 36; x += 54) {
      solids.create(x, 514, x % 108 === 18 ? 'tile:grassMidB' : 'tile:grassMidA').setScale(3).refreshBody();
      solids.create(x, 568, x % 162 === 18 ? 'tile:dirtB' : 'tile:dirtA').setScale(3).refreshBody();
    }

    solids.create(layout.ledgeX - 54, layout.ledgeY, 'tile:grassLeft').setScale(3).refreshBody();
    solids.create(layout.ledgeX, layout.ledgeY, 'tile:grassMidB').setScale(3).refreshBody();
    solids.create(layout.ledgeX + 54, layout.ledgeY, 'tile:grassRight').setScale(3).refreshBody();

    this.createCloudPlatform(platforms, layout.centerX + 20, 390 - (index % 2) * 18, 'tile:cloudLeft');
    this.createCloudPlatform(platforms, layout.centerX + 74, 390 - (index % 2) * 18, 'tile:cloudRight');

    if (index % 3 === 1) {
      solids.create(layout.centerX + 255, 430, 'tile:grassLeft').setScale(3).refreshBody();
      solids.create(layout.centerX + 309, 430, 'tile:grassRight').setScale(3).refreshBody();
    }

    if (index % 3 === 2) {
      this.add.image(layout.centerX - 210, 462, 'tile:ladderTop').setScale(2.2);
      this.add.image(layout.centerX - 210, 486, 'tile:ladder').setScale(2.2);
    }
  }

  private createCloudPlatform(platforms: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, texture: string) {
    const platform = platforms.create(x, y, texture) as Phaser.Physics.Arcade.Image;
    platform.setScale(3);
    platform.setSize(48, 8);
    platform.setOffset(0, 14);
    platform.refreshBody();
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }

  private canLandOnPlatform: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, platformObject) => {
    if (!this.player) return false;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const platformSource = platformObject as { body?: Phaser.Physics.Arcade.StaticBody };
    const platformBody = platformSource.body ?? (platformObject as Phaser.Physics.Arcade.StaticBody);
    return playerBody.velocity.y >= 0 && playerBody.bottom <= platformBody.top + 18;
  };

  private drawSegmentDecor(
    theme: string,
    layout: SegmentLayout,
    collectibles: Phaser.Physics.Arcade.StaticGroup,
    hazards: Phaser.Physics.Arcade.StaticGroup,
    index: number
  ) {
    if (index === 0 || index === portfolioTimeline.length - 1 || index % 4 === 3) {
      this.add.image(layout.startX + 42, 460, 'tile:arrow').setScale(2.2).setFlipX(true);
    } else {
      this.add.image(layout.startX + 42, 460, 'tile:sign').setScale(2.2);
    }
    this.add.image(layout.startX + 90, 462, 'tile:plantA').setScale(2.2);
    this.add.image(layout.startX + 128, 462, 'tile:plantB').setScale(2.2);
    this.add.image(layout.centerX - 12, 462, 'tile:plantC').setScale(2.1);
    if (index === 0 || index === portfolioTimeline.length - 2) {
      this.add.image(layout.centerX + 250, 462, 'tile:arrow').setScale(2.2).setFlipX(true);
    }
    this.add.image(layout.blockX, layout.blockY + 46, 'tile:block').setScale(2.2);
    this.add.image(layout.blockX - 42, layout.blockY + 24, 'tile:gem').setScale(1.8);

    const key = collectibles.create(layout.centerX + 360, 378, 'tile:key') as Phaser.Physics.Arcade.Image;
    key.setScale(2.1).setData('kind', 'key').setData('milestoneIndex', index).refreshBody();

    layout.coins.forEach((coin, coinIndex) => {
      const item = collectibles.create(coin.x, coin.y, coinIndex % 2 ? 'tile:coinB' : 'tile:coinA') as Phaser.Physics.Arcade.Image;
      item.setScale(2.2).setData('skillIndex', coin.skillIndex).setData('milestoneIndex', index).refreshBody();
      const skill = portfolioTimeline[index].skills[coin.skillIndex % portfolioTimeline[index].skills.length];
      this.add.text(coin.x - 18, coin.y + 18, skill, {
        fontFamily: 'Arial',
        fontSize: '8px',
        fontStyle: '900',
        color: '#2d2630',
        backgroundColor: '#fffbee'
      }).setDepth(4);
    });

    if (theme === 'modern') {
      this.add.image(layout.centerX + 264, 456, 'tile:pipeTopLeft').setScale(2.6);
      this.add.image(layout.centerX + 306, 456, 'tile:pipeTopRight').setScale(2.6);
      this.add.image(layout.centerX + 286, 486, 'tile:pipeBody').setScale(2.6);
    }

    const texture = theme === 'lab' ? 'char:robotA' : theme === 'australia' ? 'char:enemyB' : 'char:enemyA';
    const hazard = hazards.create(layout.hazardX, layout.hazardY, texture) as Phaser.Physics.Arcade.Image;
    this.configureHazard(hazard, theme === 'lab' ? 2.4 : 2.2);

    if (index === portfolioTimeline.length - 1) {
      this.add.image(layout.centerX + 180, 442, 'tile:sign').setScale(2.6);
      this.add.image(layout.centerX + 222, 428, 'tile:gem').setScale(2.4);
      this.add.text(layout.centerX + 150, 390, 'CONTACT', {
        fontFamily: 'Arial',
        fontSize: '15px',
        fontStyle: '900',
        color: '#2d2630',
        backgroundColor: '#fffbee'
      });
    }
  }

  private configureHazard(hazard: Phaser.Physics.Arcade.Image, scale: number) {
    hazard.setScale(scale);
    hazard.setSize(12, 12);
    hazard.setOffset(4, 6);
    hazard.refreshBody();
  }

  private tryOpenMilestone: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, blockObject) => {
    if (!this.player || this.milestoneOpen || this.scene.isPaused()) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 900) return;

    const block = blockObject as Phaser.Physics.Arcade.Image;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const blockBody = block.body as Phaser.Physics.Arcade.StaticBody;
    const horizontallyTouchingBlock = playerBody.right > blockBody.left + 4 && playerBody.left < blockBody.right - 4;
    const headReachedBlock = playerBody.top <= blockBody.bottom + 6;
    const playerIsBelowBlock = playerBody.center.y > blockBody.center.y + 10;
    const headHit = horizontallyTouchingBlock && headReachedBlock && playerIsBelowBlock && (playerBody.blocked.up || playerBody.touching.up || playerBody.velocity.y <= 0);

    if (!headHit) return;
    this.openMilestone(block);
  };

  private collectSkillItem: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, itemObject) => {
    const item = itemObject as Phaser.Physics.Arcade.Image;
    if (!item.visible) return;

    const milestoneIndex = (item.getData('milestoneIndex') as number | undefined) ?? this.chapterIndex;
    const milestone = portfolioTimeline[milestoneIndex];
    const kind = item.getData('kind') as string | undefined;

    if (kind === 'key') {
      this.floatLabel(item.x, item.y - 18, this.viewedIds.has(milestone.id) ? this.reviewedMessage() : this.hitBlockMessage());
      if (this.viewedIds.has(milestone.id)) item.destroy();
      return;
    }

    const skillIndex = (item.getData('skillIndex') as number | undefined) ?? 0;
    const skill = milestone.skills[skillIndex % milestone.skills.length];
    this.skills.add(skill);
    this.emitSkills();
    this.floatLabel(item.x, item.y - 18, skill);
    item.destroy();
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
    return navigator.language.toLowerCase().startsWith('ko') ? '장애물에 조심하세요' : 'Watch out for obstacles';
  }

  private hitBlockMessage() {
    return navigator.language.toLowerCase().startsWith('ko') ? '! 블록을 치세요' : 'Hit the ! block';
  }

  private reviewedMessage() {
    return navigator.language.toLowerCase().startsWith('ko') ? '확인 완료' : 'Reviewed';
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
    block.setTexture('tile:questionUsed');
    this.chapterIndex = milestoneIndex;
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
      this.shadow.setPosition(this.player.x, 494);
      const shadowScale = grounded ? 1 : Phaser.Math.Clamp(1 - Math.abs(this.player.y - 454) / 180, 0.42, 0.9);
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

  private emitSkills() {
    gameEvents.emitSkills({
      skills: [...this.skills],
      chapterIndex: this.chapterIndex,
      viewedIds: [...this.viewedIds]
    });
  }

  private cleanupListeners() {
    gameEvents.removeEventListener('resume-game', this.resumeFromPopup);
    window.removeEventListener('touch-control', this.handleTouchControl as EventListener);
  }

  destroy() {
    this.cleanupListeners();
  }
}
