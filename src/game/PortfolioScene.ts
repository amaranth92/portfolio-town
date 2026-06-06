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

type ScenePoint = { x: number; y: number };

type ChapterLayout = {
  block: ScenePoint;
  ledge: ScenePoint;
  coins: ScenePoint[];
  enemy: ScenePoint;
  portalX: number;
};

const worldWidth = 960;
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
  private block?: Phaser.Physics.Arcade.Image;
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
  private portalOpen = false;
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
    this.cameras.main.setDeadzone(92, 90);
    this.cameras.main.setFollowOffset(-28, 0);
    this.loadChapter(0);

    gameEvents.addEventListener('resume-game', this.resumeFromPopup);
    gameEvents.addEventListener('next-chapter', this.nextChapter);
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
      this.player.setVelocityX(Math.max(body.velocity.x - 1500 * dt, -235));
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(Math.min(body.velocity.x + 1500 * dt, 235));
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
      this.player.setPosition(64, 458);
      this.player.setVelocity(0, 0);
    }

    this.animatePlayer(time, grounded, left, right);
    this.wasGrounded = grounded;

    if (this.portalOpen && this.player.x > this.getLayout(portfolioTimeline[this.chapterIndex].chapterTheme).portalX - 28 && body.blocked.down) this.nextChapter();
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

  private loadChapter(index: number) {
    this.chapterIndex = Math.min(index, portfolioTimeline.length - 1);
    this.portalOpen = false;
    this.milestoneOpen = false;
    this.clearSceneObjects();

    const milestone = portfolioTimeline[this.chapterIndex];
    const theme = themes[milestone.chapterTheme];
    this.cameras.main.setBackgroundColor(theme.sky);
    const layout = this.getLayout(milestone.chapterTheme);
    this.drawBackground(theme, milestone.chapterTheme);

    const solids = this.physics.add.staticGroup();
    const platforms = this.physics.add.staticGroup();
    const collectibles = this.physics.add.staticGroup();
    const hazards = this.physics.add.staticGroup();
    this.drawGround(solids, platforms, layout);
    this.drawSceneDecor(milestone.chapterTheme, layout, collectibles, hazards);

    this.block = this.physics.add.staticImage(layout.block.x, layout.block.y, 'tile:question').setScale(3).setSize(46, 46);
    this.block.refreshBody();

    this.shadow = this.add.ellipse(64, 492, 42, 12, 0x25313a, 0.22).setDepth(8);
    this.player = this.physics.add.sprite(64, 454, 'char:player').setScale(2.25).setDepth(10);
    this.player.setSize(17, 21);
    this.player.setOffset(3, 2);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.scrollX = 0;

    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(this.player, platforms, undefined, this.canLandOnPlatform, this);
    this.physics.add.collider(this.player, this.block, () => this.tryOpenMilestone(), undefined, this);
    this.physics.add.overlap(this.player, collectibles, this.collectSkillItem, undefined, this);
    this.physics.add.overlap(this.player, hazards, this.hitHazard, undefined, this);

    this.add.text(22, 22, `${milestone.year}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: '900',
      color: '#2d2630'
    });
    this.add.text(22, 42, milestone.title, {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: '900',
      color: '#2d2630',
      wordWrap: { width: 280 }
    });
    gameEvents.emitChapter(this.chapterIndex);
    this.emitSkills();
  }

  private clearSceneObjects() {
    this.physics.world.colliders.destroy();
    this.children.removeAll();
  }

  private getLayout(name: string): ChapterLayout {
    const layouts: Record<string, ChapterLayout> = {
      campus: { block: { x: 392, y: 320 }, ledge: { x: 154, y: 410 }, coins: [{ x: 456, y: 334 }, { x: 506, y: 334 }, { x: 604, y: 286 }], enemy: { x: 658, y: 462 }, portalX: 876 },
      office: { block: { x: 420, y: 312 }, ledge: { x: 186, y: 396 }, coins: [{ x: 484, y: 318 }, { x: 548, y: 350 }, { x: 704, y: 300 }], enemy: { x: 672, y: 462 }, portalX: 876 },
      australia: { block: { x: 404, y: 334 }, ledge: { x: 172, y: 424 }, coins: [{ x: 470, y: 346 }, { x: 536, y: 346 }, { x: 706, y: 326 }], enemy: { x: 690, y: 462 }, portalX: 876 },
      lab: { block: { x: 412, y: 304 }, ledge: { x: 160, y: 410 }, coins: [{ x: 476, y: 316 }, { x: 542, y: 316 }, { x: 690, y: 292 }], enemy: { x: 680, y: 456 }, portalX: 876 },
      modern: { block: { x: 396, y: 322 }, ledge: { x: 184, y: 402 }, coins: [{ x: 462, y: 330 }, { x: 532, y: 330 }, { x: 728, y: 310 }], enemy: { x: 680, y: 462 }, portalX: 876 },
      contact: { block: { x: 408, y: 318 }, ledge: { x: 172, y: 408 }, coins: [{ x: 476, y: 330 }, { x: 546, y: 330 }, { x: 720, y: 314 }], enemy: { x: 686, y: 462 }, portalX: 876 }
    };
    return layouts[name] ?? layouts.campus;
  }

  private drawBackground(theme: Theme, name: string) {
    this.add.rectangle(worldWidth / 2, 470, worldWidth, 120, theme.haze, 0.38);
    if (name === 'australia') {
      this.add.circle(780, 86, 30, 0xf6c453).setStrokeStyle(4, 0x2d2630);
      this.add.rectangle(130, 456, 220, 30, 0xfff3d2, 0.5);
      this.add.rectangle(520, 438, 280, 30, 0xfff3d2, 0.5);
      this.add.rectangle(820, 456, 180, 30, 0xfff3d2, 0.5);
    } else if (name === 'office' || name === 'modern') {
      for (let i = 0; i < 10; i += 1) {
        this.add.rectangle(52 + i * 92, 414 - (i % 2) * 24, 46, 160, theme.haze, 0.32);
      }
    } else {
      [70, 390, 720].forEach((x, index) => {
        this.add.image(x, 122 + (index % 2) * 34, 'tile:cloudLeft').setScale(3);
        this.add.image(x + 54, 122 + (index % 2) * 34, 'tile:cloudMidA').setScale(3);
        this.add.image(x + 108, 122 + (index % 2) * 34, 'tile:cloudRight').setScale(3);
      });
      this.add.image(252, 176, 'tile:cloudLeft').setScale(2.5);
      this.add.image(298, 176, 'tile:cloudRight').setScale(2.5);
    }
    this.add.rectangle(worldWidth / 2, 620, worldWidth, 40, theme.water);
  }

  private drawGround(
    solids: Phaser.Physics.Arcade.StaticGroup,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    layout: ChapterLayout
  ) {
    for (let x = 18; x < worldWidth; x += 54) {
      solids.create(x, 514, 'tile:grassMidA').setScale(3).refreshBody();
      solids.create(x, 568, 'tile:dirtA').setScale(3).refreshBody();
    }
    solids.create(layout.ledge.x - 54, layout.ledge.y, 'tile:grassLeft').setScale(3).refreshBody();
    solids.create(layout.ledge.x, layout.ledge.y, 'tile:grassMidB').setScale(3).refreshBody();
    solids.create(layout.ledge.x + 54, layout.ledge.y, 'tile:grassRight').setScale(3).refreshBody();
    this.createCloudPlatform(platforms, 284, 390, 'tile:cloudLeft');
    this.createCloudPlatform(platforms, 338, 390, 'tile:cloudRight');
    this.createCloudPlatform(platforms, 566, 356, 'tile:cloudLeft');
    this.createCloudPlatform(platforms, 620, 356, 'tile:cloudRight');
    solids.create(740, 430, 'tile:grassLeft').setScale(3).refreshBody();
    solids.create(794, 430, 'tile:grassMidB').setScale(3).refreshBody();
    solids.create(848, 430, 'tile:grassRight').setScale(3).refreshBody();
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

  private drawSceneDecor(
    theme: string,
    layout: ChapterLayout,
    collectibles: Phaser.Physics.Arcade.StaticGroup,
    hazards: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.add.image(42, 460, 'tile:sign').setScale(2.5);
    this.add.image(98, 462, 'tile:plantA').setScale(2.2);
    this.add.image(126, 462, 'tile:plantB').setScale(2.2);
    this.add.image(232, 462, 'tile:plantC').setScale(2.1);
    this.add.image(520, 462, 'tile:arrow').setScale(2.2).setFlipX(true);
    const key = collectibles.create(812, 378, 'tile:key') as Phaser.Physics.Arcade.Image;
    key.setScale(2.1).setData('kind', 'key').refreshBody();
    layout.coins.forEach((coin, index) => {
      const item = collectibles.create(coin.x, coin.y, index % 2 ? 'tile:coinB' : 'tile:coinA') as Phaser.Physics.Arcade.Image;
      item.setScale(2.2).setData('skillIndex', index).refreshBody();
    });
    if (theme === 'lab') {
      const hazard = hazards.create(layout.enemy.x, layout.enemy.y, 'char:robotA') as Phaser.Physics.Arcade.Image;
      this.configureHazard(hazard, 2.4);
      this.add.image(284, 294, 'tile:gem').setScale(2.3);
    } else if (theme === 'modern') {
      this.add.image(286, 456, 'tile:pipeTopLeft').setScale(2.6);
      this.add.image(328, 456, 'tile:pipeTopRight').setScale(2.6);
    } else {
      const hazard = hazards.create(layout.enemy.x, layout.enemy.y, theme === 'australia' ? 'char:enemyB' : 'char:enemyA') as Phaser.Physics.Arcade.Image;
      this.configureHazard(hazard, 2.2);
    }
  }

  private configureHazard(hazard: Phaser.Physics.Arcade.Image, scale: number) {
    hazard.setScale(scale);
    hazard.setSize(12, 12);
    hazard.setOffset(4, 6);
    hazard.refreshBody();
  }

  private tryOpenMilestone() {
    if (!this.player || !this.block) return;
    if (this.milestoneOpen || this.scene.isPaused()) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 900) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const blockBody = this.block.body as Phaser.Physics.Arcade.StaticBody;
    const centeredUnderBlock = Math.abs(this.player.x - this.block.x) < 28;
    const headReachedBlock = body.top <= blockBody.bottom + 6;
    const playerIsBelowBlock = body.center.y > blockBody.center.y + 10;
    const headHit = centeredUnderBlock && headReachedBlock && playerIsBelowBlock && (body.blocked.up || body.touching.up || body.velocity.y <= 0);
    if (!headHit) return;

    this.openMilestone();
  }

  private collectSkillItem: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObject, itemObject) => {
    const item = itemObject as Phaser.Physics.Arcade.Image;
    if (!item.visible) return;

    const milestone = portfolioTimeline[this.chapterIndex];
    const kind = item.getData('kind') as string | undefined;
    if (kind === 'key') {
      this.floatLabel(item.x, item.y - 18, this.viewedIds.has(milestone.id) ? 'Portal ready' : 'Hit the ? block');
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
    this.floatLabel(this.player.x - 42, this.player.y - 42, '장애물에 조심하세요');
    this.player.setVelocityY(Math.min(-180, (this.player.body as Phaser.Physics.Arcade.Body).velocity.y));
  };

  private openMilestone() {
    if (!this.block) return;
    if (this.milestoneOpen || this.scene.isPaused()) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 900) return;
    this.justOpenedAt = now;
    this.milestoneOpen = true;
    const milestone = portfolioTimeline[this.chapterIndex];
    milestone.skills.forEach((skill) => this.skills.add(skill));
    this.viewedIds.add(milestone.id);
    this.block.setTexture('tile:questionUsed');
    this.emitSkills();
    gameEvents.emitMilestoneOpen({ milestone, index: this.chapterIndex });
    this.scene.pause();
  }

  private openPortal() {
    if (this.portalOpen) return;
    this.portalOpen = true;
    const group = this.add.group();
    const portalX = this.getLayout(portfolioTimeline[this.chapterIndex].chapterTheme).portalX;
    group.add(this.add.rectangle(portalX, 458, 38, 74, 0x2d2630));
    group.add(this.add.rectangle(portalX, 458, 24, 56, 0xf6c453));
    group.add(this.add.text(portalX - 18, 398, 'NEXT', { fontFamily: 'Arial', fontSize: '11px', fontStyle: '900', color: '#2d2630' }));
    gameEvents.emitPortalReady(this.chapterIndex);
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
    this.openPortal();
  };

  private nextChapter = () => {
    this.loadChapter(this.chapterIndex + 1);
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
    gameEvents.removeEventListener('next-chapter', this.nextChapter);
    window.removeEventListener('touch-control', this.handleTouchControl as EventListener);
  }

  destroy() {
    this.cleanupListeners();
  }
}
