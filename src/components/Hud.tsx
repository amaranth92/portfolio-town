import { portfolioTimeline } from '../data/portfolioTimeline';

type Props = {
  skills: string[];
  chapterIndex: number;
  recruiterMode: boolean;
  onToggleMode: () => void;
};

export function Hud({ skills, chapterIndex, recruiterMode, onToggleMode }: Props) {
  const chapter = portfolioTimeline[chapterIndex] ?? portfolioTimeline[0];
  const progress = Math.round(((chapterIndex + 1) / portfolioTimeline.length) * 100);

  return (
    <header className="hud">
      <div className="hud-title">
        <span>Milestone {chapterIndex + 1} / {portfolioTimeline.length}</span>
        <strong>{chapter.year}</strong>
        <small>{chapter.title}</small>
      </div>
      <div className="hud-progress" aria-label="Portfolio progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <button type="button" onClick={onToggleMode} aria-label={recruiterMode ? 'Switch to game mode' : 'Open recruiter mode'}>
        {recruiterMode ? 'Game' : 'Resume'}
      </button>
      <section className="hud-skills">
        <span>Stack</span>
        <div className="skill-chips">
          {(skills.length ? skills : ['Ready']).map((skill) => (
            <em key={skill}>{skill}</em>
          ))}
        </div>
      </section>
    </header>
  );
}
