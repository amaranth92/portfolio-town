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
};

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
  private justOpenedAt = 0;
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

    this.physics.world.gravity.y = 1450;
    this.physics.world.setBounds(0, 0, 360, 640);
    this.loadChapter(0);

    gameEvents.addEventListener('resume-game', () => this.resumeFromPopup());
    gameEvents.addEventListener('next-chapter', () => this.nextChapter());
    window.addEventListener('touch-control', this.handleTouchControl as EventListener);
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

    this.checkForgivingBlockHit();
    this.animatePlayer(time, grounded, left, right);
    this.wasGrounded = grounded;

    if (this.portalOpen && this.player.x > 302 && body.blocked.down) this.nextChapter();
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
    this.player.setVelocityY(-575);
    this.jumpQueuedAt = -Infinity;
    this.squashUntil = this.time.now + 120;
    this.addJumpPuff(this.player.x, this.player.y + 30);
  }

  private loadChapter(index: number) {
    this.chapterIndex = Math.min(index, portfolioTimeline.length - 1);
    this.portalOpen = false;
    this.clearSceneObjects();

    const milestone = portfolioTimeline[this.chapterIndex];
    const theme = themes[milestone.chapterTheme];
    this.cameras.main.setBackgroundColor(theme.sky);
    const layout = this.getLayout(milestone.chapterTheme);
    this.drawBackground(theme, milestone.chapterTheme);

    const solids = this.physics.add.staticGroup();
    this.drawGround(solids, layout);
    this.drawSceneDecor(milestone.chapterTheme, layout);

    this.block = this.physics.add.staticImage(layout.block.x, layout.block.y, 'tile:question').setScale(3).setSize(46, 46);
    this.block.setInteractive({ useHandCursor: true });
    this.block.on('pointerdown', () => this.openMilestone());
    this.block.refreshBody();

    this.shadow = this.add.ellipse(64, 492, 42, 12, 0x25313a, 0.22).setDepth(8);
    this.player = this.physics.add.sprite(64, 454, 'char:player').setScale(2.25).setDepth(10);
    this.player.setSize(17, 21);
    this.player.setOffset(3, 2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(this.player, this.block, () => this.tryOpenMilestone(), undefined, this);

    this.add.text(16, 18, `${milestone.year}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: '900',
      color: '#2d2630'
    });
    this.add.text(16, 38, milestone.title, {
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
      campus: { block: { x: 184, y: 320 }, ledge: { x: 76, y: 410 }, coins: [{ x: 244, y: 334 }, { x: 294, y: 334 }], enemy: { x: 300, y: 462 } },
      office: { block: { x: 188, y: 312 }, ledge: { x: 82, y: 396 }, coins: [{ x: 238, y: 318 }, { x: 288, y: 350 }], enemy: { x: 298, y: 462 } },
      australia: { block: { x: 176, y: 334 }, ledge: { x: 84, y: 424 }, coins: [{ x: 230, y: 346 }, { x: 282, y: 346 }], enemy: { x: 302, y: 462 } },
      lab: { block: { x: 188, y: 304 }, ledge: { x: 70, y: 410 }, coins: [{ x: 246, y: 316 }, { x: 298, y: 316 }], enemy: { x: 300, y: 456 } },
      modern: { block: { x: 182, y: 322 }, ledge: { x: 92, y: 402 }, coins: [{ x: 240, y: 330 }, { x: 294, y: 330 }], enemy: { x: 302, y: 462 } },
      contact: { block: { x: 180, y: 318 }, ledge: { x: 82, y: 408 }, coins: [{ x: 246, y: 330 }, { x: 296, y: 330 }], enemy: { x: 302, y: 462 } }
    };
    return layouts[name] ?? layouts.campus;
  }

  private drawBackground(theme: Theme, name: string) {
    this.add.rectangle(180, 470, 360, 120, theme.haze, 0.38);
    if (name === 'australia') {
      this.add.circle(290, 86, 30, 0xf6c453).setStrokeStyle(4, 0x2d2630);
      this.add.rectangle(70, 456, 150, 30, 0xfff3d2, 0.5);
      this.add.rectangle(260, 438, 160, 30, 0xfff3d2, 0.5);
    } else if (name === 'office' || name === 'modern') {
      for (let i = 0; i < 4; i += 1) {
        this.add.rectangle(52 + i * 86, 414 - (i % 2) * 24, 46, 160, theme.haze, 0.32);
      }
    } else {
      this.add.image(70, 122, 'tile:cloudLeft').setScale(3);
      this.add.image(124, 122, 'tile:cloudMidA').setScale(3);
      this.add.image(178, 122, 'tile:cloudRight').setScale(3);
      this.add.image(248, 166, 'tile:cloudLeft').setScale(2.5);
      this.add.image(294, 166, 'tile:cloudRight').setScale(2.5);
    }
    this.add.rectangle(180, 620, 360, 40, theme.water);
  }

  private drawGround(solids: Phaser.Physics.Arcade.StaticGroup, layout: ChapterLayout) {
    for (let x = 18; x < 360; x += 54) {
      solids.create(x, 514, 'tile:grassMidA').setScale(3).refreshBody();
      solids.create(x, 568, 'tile:dirtA').setScale(3).refreshBody();
    }
    solids.create(layout.ledge.x - 54, layout.ledge.y, 'tile:grassLeft').setScale(3).refreshBody();
    solids.create(layout.ledge.x, layout.ledge.y, 'tile:grassMidB').setScale(3).refreshBody();
    solids.create(layout.ledge.x + 54, layout.ledge.y, 'tile:grassRight').setScale(3).refreshBody();
    solids.create(248, 390, 'tile:cloudLeft').setScale(3).refreshBody();
    solids.create(302, 390, 'tile:cloudRight').setScale(3).refreshBody();
  }

  private drawSceneDecor(theme: string, layout: ChapterLayout) {
    this.add.image(42, 460, 'tile:sign').setScale(2.5);
    this.add.image(98, 462, 'tile:plantA').setScale(2.2);
    this.add.image(126, 462, 'tile:plantB').setScale(2.2);
    layout.coins.forEach((coin, index) => this.add.image(coin.x, coin.y, index % 2 ? 'tile:coinB' : 'tile:coinA').setScale(2.2));
    if (theme === 'lab') {
      this.add.image(layout.enemy.x, layout.enemy.y, 'char:robotA').setScale(2.4);
      this.add.image(284, 294, 'tile:gem').setScale(2.3);
    } else if (theme === 'modern') {
      this.add.image(286, 456, 'tile:pipeTopLeft').setScale(2.6);
      this.add.image(328, 456, 'tile:pipeTopRight').setScale(2.6);
    } else {
      this.add.image(layout.enemy.x, layout.enemy.y, theme === 'australia' ? 'char:enemyB' : 'char:enemyA').setScale(2.2);
    }
  }

  private tryOpenMilestone() {
    if (!this.player || !this.block) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 500) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const headHit = body.velocity.y < 0 || this.player.y > this.block.y + 20;
    if (!headHit) return;

    this.openMilestone();
  }

  private checkForgivingBlockHit() {
    if (!this.player || !this.block) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const closeX = Math.abs(this.player.x - this.block.x) < 44;
    const underBlock = this.player.y > this.block.y + 24 && this.player.y < this.block.y + 118;
    if (closeX && underBlock && body.velocity.y < -160) this.openMilestone();
  }

  private openMilestone() {
    if (!this.block) return;
    const now = this.time.now;
    if (now - this.justOpenedAt < 500) return;
    this.justOpenedAt = now;
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
    group.add(this.add.rectangle(324, 458, 38, 74, 0x2d2630));
    group.add(this.add.rectangle(324, 458, 24, 56, 0xf6c453));
    group.add(this.add.text(306, 398, 'NEXT', { fontFamily: 'Arial', fontSize: '11px', fontStyle: '900', color: '#2d2630' }));
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

  private resumeFromPopup() {
    this.scene.resume();
    this.openPortal();
  }

  private nextChapter() {
    this.loadChapter(this.chapterIndex + 1);
  }

  private emitSkills() {
    gameEvents.emitSkills({
      skills: [...this.skills],
      chapterIndex: this.chapterIndex,
      viewedIds: [...this.viewedIds]
    });
  }

  destroy() {
    window.removeEventListener('touch-control', this.handleTouchControl as EventListener);
  }
}
