import { profile, portfolioTimeline } from '../data/portfolioTimeline';
import type { Locale } from '../game/gameEvents';

type Props = {
  locale: Locale;
  onExitToGame: () => void;
};

type RecruiterLabels = {
  title: string;
  subtitle: string;
  navSummary: string;
  navSkills: string;
  navTimeline: string;
  navContact: string;
  summary: string;
  resumeSkillTitle: string;
  gameSkillTitle: string;
  navGameSkills: string;
  contactTitle: string;
};

const LABELS: Record<Locale, RecruiterLabels> = {
  en: {
    title: 'Resume mode',
    subtitle: 'Timeline, skill stacks, and summary that are easier to read on desktop and mobile.',
    navSummary: 'Summary',
    navSkills: 'Skills',
    navTimeline: 'Timeline',
    navContact: 'Contact',
    summary: 'This page summarizes my profile for quick review.',
    resumeSkillTitle: 'Resume skills',
    gameSkillTitle: 'Game mode skills',
    navGameSkills: 'Game skills',
    contactTitle: 'Links'
  },
  ko: {
    title: 'Resume mode',
    subtitle: '데스크톱/모바일에서 보기 쉬운 이력 요약입니다.',
    navSummary: '요약',
    navSkills: '스킬',
    navTimeline: '타임라인',
    navContact: '연락',
    summary: '채용자가 빠르게 훑어볼 수 있도록 정리한 이력입니다.',
    resumeSkillTitle: '이력 기반 스킬',
    gameSkillTitle: '게임 플레이 스킬',
    navGameSkills: '게임 스킬',
    contactTitle: '링크'
  }
};

function isReadableKorean(text: string | undefined) {
  if (!text) return false;
  return /[가-힣]/.test(text);
}

function getLocalizedMilestone(locale: Locale, index: number) {
  const milestone = portfolioTimeline[index];
  if (locale !== 'ko' || !milestone.ko) {
    return {
      title: milestone.title,
      subtitle: milestone.subtitle,
      summary: milestone.summary,
      details: milestone.details
    };
  }

  const ko = milestone.ko;
  const hasKorean = [ko.title, ko.subtitle, ko.summary, ...(ko.details ?? [])].every(isReadableKorean);
  if (!hasKorean) return getLocalizedMilestone('en', index);

  return {
    title: ko.title,
    subtitle: ko.subtitle,
    summary: ko.summary,
    details: ko.details
  };
}

function MilestoneCard({ milestone, locale }: { milestone: (typeof portfolioTimeline)[number]; locale: Locale }) {
  const index = portfolioTimeline.indexOf(milestone);
  const content = getLocalizedMilestone(locale, index);

  return (
    <article className="recruiter-card">
      <header className="recruiter-card-head">
        <span className="recruiter-year">{milestone.year}</span>
        <h3>{content.title}</h3>
      </header>
      <p className="recruiter-subtitle">{content.subtitle}</p>
      <p className="recruiter-note">{content.summary}</p>
      <ul className="recruiter-details">
        {content.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
      <div className="recruiter-skills">
        {milestone.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </article>
  );
}

export function RecruiterMode({ locale, onExitToGame }: Props) {
  const labels = LABELS[locale];
  const allSkills = [...new Set(portfolioTimeline.flatMap((milestone) => milestone.skills))];
  const gameModeSkills = [
    'Platforming',
    'Physics',
    'Collision handling',
    'State routing',
    'UI transitions',
    'Popup controls',
    'Asset-driven mapping'
  ];

  return (
    <main className="recruiter-mode">
      <div className="recruiter-actions">
        <button type="button" onClick={onExitToGame} className="recruiter-back">
          {locale === 'ko' ? '게임 모드로' : 'Back to game'}
        </button>
      </div>

      <div className="recruiter-badge">{locale === 'ko' ? '이력 모드' : 'Resume mode'}</div>
      <nav className="recruiter-nav" aria-label={locale === 'ko' ? '이력 탐색' : 'Resume navigation'}>
        <a href="#resume-summary">{labels.navSummary}</a>
        <a href="#resume-skills">{labels.navSkills}</a>
        <a href="#resume-timeline">{labels.navTimeline}</a>
        <a href="#resume-contact">{labels.navContact}</a>
      </nav>

      <section className="recruiter-hero" id="resume-summary">
        <p className="recruiter-kicker">{profile.name}</p>
        <h1>{labels.title}</h1>
        <p className="recruiter-subtitle">{labels.subtitle}</p>
        <p className="recruiter-note">{labels.summary}</p>
      </section>

      <section id="resume-skills">
        <h2>{labels.resumeSkillTitle}</h2>
        <div className="recruiter-skill-grid recruiter-skill-grid--compact">
          {allSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section id="resume-timeline">
        <h2>{labels.navTimeline}</h2>
        <div className="recruiter-timeline">
          {portfolioTimeline.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} locale={locale} />
          ))}
        </div>
      </section>

      <section id="resume-game-skills">
        <h2>{labels.navGameSkills}</h2>
        <div className="recruiter-skill-grid recruiter-skill-grid--compact">
          {gameModeSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section id="resume-contact" className="recruiter-contact">
        <h2>{labels.contactTitle}</h2>
        <div className="recruiter-links">
          {profile.links.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
