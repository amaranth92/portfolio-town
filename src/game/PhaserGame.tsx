import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PortfolioScene } from './PortfolioScene';

type GameSize = {
  width: number;
  height: number;
};

function getGameSize(): GameSize {
  if (window.matchMedia('(min-width: 900px)').matches) {
    return { width: 960, height: 540 };
  }

  return { width: 360, height: 640 };
}

export function PhaserGame() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [gameSize, setGameSize] = useState(getGameSize);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px)');
    const syncSize = () => setGameSize(getGameSize());

    media.addEventListener('change', syncSize);
    return () => media.removeEventListener('change', syncSize);
  }, []);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: '#d9f2f1',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameSize.width,
        height: gameSize.height
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 1450 },
          debug: false
        }
      },
      scene: [PortfolioScene]
    });

    return () => {
      game.destroy(true);
    };
  }, [gameSize]);

  return <div ref={hostRef} className="game-host" data-layout={gameSize.width > gameSize.height ? 'desktop' : 'mobile'} aria-label="Playable portfolio chapter" />;
}
