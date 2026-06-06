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
      <div>
        <span>Chapter {chapterIndex + 1} / {portfolioTimeline.length}</span>
        <strong>{chapter.year}</strong>
        <small>{chapter.title}</small>
      </div>
      <div className="hud-progress" aria-label="Portfolio progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <section>
        <span>Skills</span>
        <div className="skill-chips">
          {(skills.length ? skills : ['Ready']).map((skill) => (
            <em key={skill}>{skill}</em>
          ))}
        </div>
      </section>
      <button type="button" onClick={onToggleMode}>
        {recruiterMode ? 'Game Mode' : 'Recruiter Mode'}
      </button>
    </header>
  );
}
