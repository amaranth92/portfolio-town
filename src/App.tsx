import { useEffect, useState } from 'react';
import { Hud } from './components/Hud';
import { PortfolioPopup } from './components/PortfolioPopup';
import { RecruiterMode } from './components/RecruiterMode';
import { TouchControls } from './components/TouchControls';
import type { PortfolioMilestone } from './data/portfolioTimeline';
import { PhaserGame } from './game/PhaserGame';
import { gameEvents, type MilestoneOpenEvent, type SkillsEvent } from './game/gameEvents';

function App() {
  const [activeMilestone, setActiveMilestone] = useState<PortfolioMilestone | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [recruiterMode, setRecruiterMode] = useState(false);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<MilestoneOpenEvent>).detail;
      setActiveMilestone((current) => current ?? detail.milestone);
      setChapterIndex(detail.index);
    };
    const skillChange = (event: Event) => {
      const detail = (event as CustomEvent<SkillsEvent>).detail;
      setSkills(detail.skills);
      setChapterIndex(detail.chapterIndex);
    };
    const chapterChange = (event: Event) => setChapterIndex((event as CustomEvent<number>).detail);
    const resume = () => setActiveMilestone(null);

    gameEvents.addEventListener('milestone-open', open);
    gameEvents.addEventListener('skills-change', skillChange);
    gameEvents.addEventListener('chapter-change', chapterChange);
    gameEvents.addEventListener('resume-game', resume);
    return () => {
      gameEvents.removeEventListener('milestone-open', open);
      gameEvents.removeEventListener('skills-change', skillChange);
      gameEvents.removeEventListener('chapter-change', chapterChange);
      gameEvents.removeEventListener('resume-game', resume);
    };
  }, []);

  useEffect(() => {
    if (!activeMilestone) return undefined;

    const closeWithKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') gameEvents.resumeGame();
    };
    const closeWithJump = (event: Event) => {
      const detail = (event as CustomEvent<{ control: string; pressed: boolean }>).detail;
      if (detail.control === 'jump' && detail.pressed) gameEvents.resumeGame();
    };

    window.addEventListener('keydown', closeWithKey);
    window.addEventListener('touch-control', closeWithJump as EventListener);
    return () => {
      window.removeEventListener('keydown', closeWithKey);
      window.removeEventListener('touch-control', closeWithJump as EventListener);
    };
  }, [activeMilestone]);

  return (
    <div className="app-shell">
      <Hud
        skills={skills}
        chapterIndex={chapterIndex}
        recruiterMode={recruiterMode}
        onToggleMode={() => setRecruiterMode((value) => !value)}
      />
      {recruiterMode ? (
        <RecruiterMode />
      ) : (
        <main className="game-layout">
          <PhaserGame />
          <TouchControls />
          <p className="control-hint">Hit the ? block from below. Read, continue, then enter the portal.</p>
        </main>
      )}
      <PortfolioPopup milestone={activeMilestone} />
    </div>
  );
}

export default App;
