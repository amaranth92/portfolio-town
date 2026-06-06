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
  private viewedIds = new Set<string>();
  private skills = new Set<string>();
  private portalOpen = false;
  private justOpenedAt = 0;

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

  update() {
    if (!this.player || !this.cursors || !this.keys) return;
    const left = this.cursors.left.isDown || this.keys.left.isDown || this.moveLeft;
    const right = this.cursors.right.isDown || this.keys.right.isDown || this.moveRight;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (left) {
      this.player.setVelocityX(-210);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(210);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.jumpHeld) this.jump();

    if (this.player.y > 620) {
      this.player.setPosition(64, 458);
      this.player.setVelocity(0, 0);
    }

    if (this.portalOpen && this.player.x > 302 && body.blocked.down) this.nextChapter();
  }

  private handleTouchControl = (event: Event) => {
    const detail = (event as CustomEvent<{ control: string; pressed: boolean }>).detail;
    this.moveLeft = detail.control === 'left' ? detail.pressed : this.moveLeft;
    this.moveRight = detail.control === 'right' ? detail.pressed : this.moveRight;
    this.jumpHeld = detail.control === 'jump' ? detail.pressed : this.jumpHeld;
    if (detail.control === 'jump' && detail.pressed) this.jump();
  };

  private jump() {
    if (!this.player) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down || body.touching.down) this.player.setVelocityY(-555);
  }

  private loadChapter(index: number) {
    this.chapterIndex = Math.min(index, portfolioTimeline.length - 1);
    this.portalOpen = false;
    this.clearSceneObjects();

    const milestone = portfolioTimeline[this.chapterIndex];
    const theme = themes[milestone.chapterTheme];
    this.cameras.main.setBackgroundColor(theme.sky);
    this.drawBackground(theme, milestone.chapterTheme);

    const solids = this.physics.add.staticGroup();
    this.drawGround(solids);
    this.drawSceneDecor(milestone.chapterTheme);

    this.block = this.physics.add.staticImage(180, 292, 'tile:question').setScale(3).setSize(46, 46);
    this.block.setInteractive({ useHandCursor: true });
    this.block.on('pointerdown', () => this.openMilestone());
    this.block.refreshBody();

    this.player = this.physics.add.sprite(64, 454, 'char:player').setScale(2.2);
    this.player.setSize(18, 22);
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

  private drawGround(solids: Phaser.Physics.Arcade.StaticGroup) {
    for (let x = 18; x < 360; x += 54) {
      solids.create(x, 514, 'tile:grassMidA').setScale(3).refreshBody();
      solids.create(x, 568, 'tile:dirtA').setScale(3).refreshBody();
    }
    solids.create(18, 406, 'tile:grassLeft').setScale(3).refreshBody();
    solids.create(72, 406, 'tile:grassMidB').setScale(3).refreshBody();
    solids.create(126, 406, 'tile:grassRight').setScale(3).refreshBody();
    solids.create(248, 390, 'tile:cloudLeft').setScale(3).refreshBody();
    solids.create(302, 390, 'tile:cloudRight').setScale(3).refreshBody();
  }

  private drawSceneDecor(theme: string) {
    this.add.image(42, 460, 'tile:sign').setScale(2.5);
    this.add.image(98, 462, 'tile:plantA').setScale(2.2);
    this.add.image(126, 462, 'tile:plantB').setScale(2.2);
    this.add.image(248, 330, 'tile:coinA').setScale(2.2);
    this.add.image(296, 330, 'tile:coinB').setScale(2.2);
    if (theme === 'lab') {
      this.add.image(300, 460, 'char:robotA').setScale(2.4);
      this.add.image(284, 294, 'tile:gem').setScale(2.3);
    } else if (theme === 'modern') {
      this.add.image(286, 456, 'tile:pipeTopLeft').setScale(2.6);
      this.add.image(328, 456, 'tile:pipeTopRight').setScale(2.6);
    } else {
      this.add.image(300, 460, theme === 'australia' ? 'char:enemyB' : 'char:enemyA').setScale(2.2);
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
