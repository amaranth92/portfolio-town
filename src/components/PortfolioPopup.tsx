import type { PortfolioMilestone } from '../data/portfolioTimeline';
import { gameEvents } from '../game/gameEvents';

type Props = {
  milestone: PortfolioMilestone | null;
};

export function PortfolioPopup({ milestone }: Props) {
  if (!milestone) return null;

  return (
    <div className="popup-backdrop" role="presentation">
      <article className="portfolio-popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
        <span>{milestone.year}</span>
        <h2 id="popup-title">{milestone.title}</h2>
        <p>{milestone.summary}</p>
        <ul>
          {milestone.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <div className="popup-skills">
          {milestone.skills.map((skill) => (
            <em key={skill}>{skill}</em>
          ))}
        </div>
        <button type="button" onClick={() => gameEvents.resumeGame()}>
          Close and Resume
        </button>
      </article>
    </div>
  );
}
