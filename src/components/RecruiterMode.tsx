import { profile, portfolioTimeline } from '../data/portfolioTimeline';
import type { Locale } from '../game/gameEvents';
import type { PortfolioMilestone } from '../data/portfolioTimeline';

type Props = {
  locale: Locale;
  onExitToGame: () => void;
};

type ResumeLang = {
  navSummary: string;
  navSkills: string;
  navTimeline: string;
  navContact: string;
  summary: string;
  skillTitle: string;
  timelineTitle: string;
  contactTitle: string;
  linksTitle: string;
  backToGame: string;
};

const LABELS: Record<Locale, ResumeLang> = {
  ko: {
    navSummary: '요약',
    navSkills: '이력서 스택',
    navTimeline: '경력',
    navContact: '연락처',
    summary:
      '이력서 모드에서는 게임 없이 순차적으로 전체 경력을 읽을 수 있습니다. 좌측 하단의 누적 스택은 게임 진행에서 수집된 모든 항목입니다.',
    skillTitle: '누적 스킬',
    timelineTitle: '경력 타임라인',
    contactTitle: '연락처',
    linksTitle: '링크',
    backToGame: '게임으로 돌아가기'
  },
  en: {
    navSummary: 'Summary',
    navSkills: 'Resume stack',
    navTimeline: 'Timeline',
    navContact: 'Contact',
    summary:
      'Resume mode shows the complete portfolio in one scrollable page without gameplay. Collected skills are merged with all milestones for quick scan.',
    skillTitle: 'Resume stack',
    timelineTitle: 'Career timeline',
    contactTitle: 'Contact',
    linksTitle: 'Links',
    backToGame: 'Back to game'
  }
};

const hasReadableKorean = (text: string) => /[가-힣]/.test(text);

function chooseLocalized(locale: Locale, milestone: PortfolioMilestone): Pick<PortfolioMilestone, 'title' | 'subtitle' | 'summary' | 'details'> {
  if (locale !== 'ko' || !milestone.ko) {
    return {
      title: milestone.title,
      subtitle: milestone.subtitle,
      summary: milestone.summary,
      details: milestone.details
    };
  }

  const ko = milestone.ko;
  const hasValidKorean = [ko.title, ko.subtitle, ko.summary, ...(ko.details ?? [])].every(hasReadableKorean);
  if (!hasValidKorean) {
    return {
      title: milestone.title,
      subtitle: milestone.subtitle,
      summary: milestone.summary,
      details: milestone.details
    };
  }

  return {
    title: ko.title,
    subtitle: ko.subtitle,
    summary: ko.summary,
    details: ko.details
  };
}

function isReadableProfile(locale: Locale) {
  if (locale === 'en') {
    return {
      name: profile.name,
      headline: profile.headline,
      location: profile.location,
      experience: profile.experience,
      note: profile.contact.note
    };
  }

  if (!profile.ko || !hasReadableKorean(profile.ko.name)) {
    return {
      name: profile.name,
      headline: profile.headline,
      location: profile.location,
      experience: profile.experience,
      note: profile.contact.note
    };
  }

  return {
    name: profile.ko.name,
    headline: profile.ko.headline,
    location: profile.ko.location,
    experience: profile.ko.experience,
    note: profile.ko.contactNote
  };
}

function MilestoneCard({ milestone, locale }: { milestone: PortfolioMilestone; locale: Locale }) {
  const content = chooseLocalized(locale, milestone);

  return (
    <article className="recruiter-card">
      <header className="recruiter-card-head">
        <span>{milestone.year}</span>
        <h3>{content.title}</h3>
      </header>
      <p className="recruiter-subtitle">{content.subtitle}</p>
      <p>{content.summary}</p>
      <ul>
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
  const profileText = isReadableProfile(locale);

  return (
    <main className="recruiter-mode">
      <div className="recruiter-actions">
        <button type="button" onClick={onExitToGame} className="recruiter-back">
          {labels.backToGame}
        </button>
      </div>

      <nav className="recruiter-nav" aria-label={locale === 'ko' ? '이력서 네비게이션' : 'Resume navigation'}>
        <a href="#resume-summary">{labels.navSummary}</a>
        <a href="#resume-skills">{labels.navSkills}</a>
        <a href="#resume-timeline">{labels.navTimeline}</a>
        <a href="#resume-contact">{labels.navContact}</a>
      </nav>

      <section className="recruiter-hero" id="resume-summary">
        <p>{labels.navSummary}</p>
        <h1>{profileText.name}</h1>
        <strong>{profileText.headline}</strong>
        <p>{profileText.location}</p>
        <p>{profileText.experience}</p>
        <p className="recruiter-note">{labels.summary}</p>
      </section>

      <section id="resume-skills">
        <h2>{labels.skillTitle}</h2>
        <div className="recruiter-skill-grid">
          {allSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section id="resume-timeline">
        <h2>{labels.timelineTitle}</h2>
        <div className="recruiter-timeline">
          {portfolioTimeline.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} locale={locale} />
          ))}
        </div>
      </section>

      <section id="resume-contact">
        <h2>{labels.contactTitle}</h2>
        <h3>{labels.linksTitle}</h3>
        <p>{profileText.note}</p>
        <div className="recruiter-links">
          {profile.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
