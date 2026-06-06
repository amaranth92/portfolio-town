import { portfolioTimeline } from '../data/portfolioTimeline';
import type { Locale } from '../game/gameEvents';

type Props = {
  skills: string[];
  chapterIndex: number;
  recruiterMode: boolean;
  onToggleMode: () => void;
  locale: Locale;
  onToggleLocale: () => void;
  isKorean: boolean;
};

export function Hud({ skills, chapterIndex, recruiterMode, onToggleMode, locale, onToggleLocale, isKorean }: Props) {
  const chapter = portfolioTimeline[chapterIndex] ?? portfolioTimeline[0];
  const progress = Math.round(((chapterIndex + 1) / portfolioTimeline.length) * 100);
  const title = isKorean && chapter.ko ? chapter.ko.title : chapter.title;

  return (
    <header className="hud">
      <div className="hud-title">
        <span>
          {isKorean ? '이력' : 'Milestone'} {chapterIndex + 1} / {portfolioTimeline.length}
        </span>
        <strong>{chapter.year}</strong>
        <small>{title}</small>
      </div>
      <div className="hud-progress" aria-label={isKorean ? '포트폴리오 진행률' : 'Portfolio progress'}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="hud-actions">
        <button type="button" onClick={onToggleLocale} aria-label={isKorean ? 'Switch to English' : '한국어로 변경'}>
          {locale === 'ko' ? 'EN' : 'KO'}
        </button>
        <button type="button" onClick={onToggleMode} aria-label={recruiterMode ? 'Switch to game mode' : 'Open recruiter mode'}>
          {recruiterMode ? (isKorean ? '게임' : 'Game') : isKorean ? '이력서' : 'Resume'}
        </button>
      </div>
      <section className="hud-skills">
        <span>{isKorean ? '보유 기술' : 'Skills collected'}</span>
        <div className="skill-chips">
          {(skills.length ? skills : [isKorean ? '준비' : 'Ready']).map((skill) => (
            <em key={skill}>{skill}</em>
          ))}
        </div>
      </section>
    </header>
  );
}
