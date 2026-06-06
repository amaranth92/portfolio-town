import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PortfolioScene } from './PortfolioScene';

export function PhaserGame() {
  const hostRef = useRef<HTMLDivElement | null>(null);

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
        width: 360,
        height: 640
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
  }, []);

  return <div ref={hostRef} className="game-host" aria-label="Playable portfolio chapter" />;
}
