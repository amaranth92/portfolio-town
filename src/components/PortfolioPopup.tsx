import { profile, type PortfolioMilestone } from '../data/portfolioTimeline';
import { gameEvents } from '../game/gameEvents';

type Props = {
  milestone: PortfolioMilestone | null;
  isKorean: boolean;
};

export function PortfolioPopup({ milestone, isKorean }: Props) {
  if (!milestone) return null;

  const isReadableKo = (value: string | undefined) => value !== undefined && /[가-힣]/.test(value);
  const hasKoText =
    isKorean &&
    isReadableKo(milestone.ko?.title) &&
    isReadableKo(milestone.ko?.summary) &&
    (milestone.ko?.details ?? []).every((detail) => isReadableKo(detail));

  const content = hasKoText && milestone.ko ? milestone.ko : milestone;

  return (
    <div className="popup-backdrop" role="presentation">
      <article className="portfolio-popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
        <span>{milestone.year}</span>
        <h2 id="popup-title">{content.title}</h2>
        <p>{content.summary}</p>
        <ul>
          {content.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <div className="popup-skills">
          {milestone.skills.map((skill) => (
            <em key={skill}>{skill}</em>
          ))}
        </div>
        {milestone.id === 'contact' ? (
          <div className="popup-links">
            {profile.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        <button type="button" onClick={() => gameEvents.resumeGame()}>
          {isKorean ? '팝업 닫기' : 'Close and resume'}
        </button>
      </article>
    </div>
  );
}