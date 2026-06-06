import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PortfolioScene } from './PortfolioScene';

type GameSize = {
  width: number;
  height: number;
};

function getGameSize(): GameSize {
  // 데스크톱은 가로 스테이지, 모바일은 세로 조작감을 우선하는 크기로 Phaser 캔버스를 다시 만듭니다.
  if (window.matchMedia('(min-width: 900px)').matches) {
    return { width: 960, height: 540 };
  }

  return { width: 360, height: 640 };
}

export function PhaserGame() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [gameSize, setGameSize] = useState(getGameSize);

  useEffect(() => {
    // 데스크톱/모바일 breakpoint가 바뀌면 캔버스 비율 자체가 달라집니다.
    // CSS scale만 바꾸지 않고 Phaser 인스턴스를 재생성해 카메라 bounds와 물리 world size를 함께 맞춥니다.
    const media = window.matchMedia('(min-width: 900px)');
    const syncSize = () => setGameSize(getGameSize());

    media.addEventListener('change', syncSize);
    return () => media.removeEventListener('change', syncSize);
  }, []);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    // gameSize가 바뀌면 Phaser 인스턴스를 재생성하므로, 씬 내부 상태도 함께 초기화됩니다.
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
