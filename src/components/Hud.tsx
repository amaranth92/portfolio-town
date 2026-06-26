import { portfolioTimeline } from '../data/portfolioTimeline';
import type { Locale } from '../game/gameEvents';

type Props = {
  skills: string[];
  chapterIndex: number;
  recruiterMode: boolean;
  onToggleMode: () => void;
  onOpenResume: () => void;
  onOpenGame: () => void;
  locale: Locale;
  onToggleLocale: () => void;
  isKorean: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
};

export function Hud({
  skills,
  chapterIndex,
  recruiterMode,
  onToggleMode,
  onOpenResume,
  onOpenGame,
  locale,
  onToggleLocale,
  isKorean,
  menuOpen,
  onToggleMenu,
  onCloseMenu
}: Props) {
  const chapter = portfolioTimeline[chapterIndex] ?? portfolioTimeline[0];
  const progress = Math.round(((chapterIndex + 1) / portfolioTimeline.length) * 100);
  const title = chapter.title;

  const modeTitle = recruiterMode
    ? isKorean
      ? '이력서 모드'
      : 'Resume mode'
    : isKorean
      ? '게임 모드'
      : 'Game mode';

  const skillsLabel = recruiterMode
    ? isKorean
      ? '이력서 스택'
      : 'Resume stack'
    : isKorean
      ? '획득 스킬'
      : 'Collected skills';

  const localeLabel = locale === 'ko' ? 'Switch to English' : '한국어로 보기';

  return (
    <header className="hud">
      <div className="hud-title">
        <span>
          {isKorean ? '타임라인' : 'Timeline'} {chapterIndex + 1} / {portfolioTimeline.length}
        </span>
        <strong>{chapter.year}</strong>
        <small>{title}</small>
      </div>
      <div className="hud-progress" aria-label={isKorean ? '포트폴리오 진행률' : 'Portfolio progress'}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="hud-actions">
        <button type="button" onClick={onToggleMenu} aria-label={isKorean ? '메뉴 열기' : 'Open menu'} aria-expanded={menuOpen}>
          {isKorean ? '메뉴' : 'Menu'}
        </button>
        <button type="button" onClick={onToggleLocale} aria-label={localeLabel}>
          {locale === 'ko' ? 'EN' : 'KO'}
        </button>
        <button
          type="button"
          onClick={onToggleMode}
          aria-label={
            recruiterMode ? (isKorean ? '게임으로' : 'Back to game') : isKorean ? '이력서 보기' : 'Switch to Resume mode'
          }
        >
          {recruiterMode ? (isKorean ? '게임으로' : 'Back to game') : isKorean ? '이력서 보기' : 'Resume'}
        </button>
      </div>

      {menuOpen && (
        <aside className="hud-menu" role="dialog" aria-label={isKorean ? '뷰 모드 메뉴' : 'View mode menu'}>
          <button type="button" onClick={onOpenResume} aria-label={isKorean ? '이력서 모드 열기' : 'Open resume mode'}>
            {isKorean ? '이력서 보기' : 'Resume mode'}
          </button>
          <button type="button" onClick={onOpenGame} aria-label={isKorean ? '게임 모드 열기' : 'Open game mode'}>
            {recruiterMode ? (isKorean ? '게임으로' : 'Game mode') : isKorean ? '게임' : 'Game'}
          </button>
          <button type="button" onClick={onCloseMenu} aria-label={isKorean ? '메뉴 닫기' : 'Close menu'}>
            {isKorean ? '닫기' : 'Close'}
          </button>
        </aside>
      )}

      <section className="hud-skills" aria-label={isKorean ? '보유 스킬' : 'Skill list'}>
        <span>
          {modeTitle} - {skillsLabel}
        </span>
        <div className="skill-chips">
          {(skills.length ? skills : [isKorean ? '준비됨' : 'Ready']).map((skill) => (
            <em key={skill}>{skill}</em>
          ))}
        </div>
      </section>
    </header>
  );
}
