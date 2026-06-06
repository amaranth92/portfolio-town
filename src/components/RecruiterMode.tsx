import { portfolioTimeline, profile } from '../data/portfolioTimeline';

type Props = {
  isKorean: boolean;
};

export function RecruiterMode({ isKorean }: Props) {
  const allSkills = [...new Set(portfolioTimeline.flatMap((item) => item.skills))];
  const profileText = isKorean
    ? {
        name: profile.ko.name,
        headline: profile.ko.headline,
        location: profile.ko.location,
        experience: profile.ko.experience,
        note: profile.ko.contactNote
      }
    : {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        experience: profile.experience,
        note: profile.contact.note
      };

  return (
    <main className="recruiter-mode">
      <section className="recruiter-hero">
        <p>{profileText.location}</p>
        <h1>{profileText.name}</h1>
        <strong>{profileText.headline}</strong>
        <span>{profileText.experience}</span>
      </section>

      <section>
        <h2>{isKorean ? '주요 기술' : 'Core skills'}</h2>
        <div className="recruiter-skills">
          {allSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section>
        <h2>{isKorean ? '타임라인' : 'Timeline'}</h2>
        <div className="recruiter-timeline">
          {portfolioTimeline.map((item) => {
            const content = isKorean && item.ko ? item.ko : item;
            return (
              <article key={item.id}>
                <span>{item.year}</span>
                <h3>{content.title}</h3>
                <strong>{content.subtitle}</strong>
                <p>{content.summary}</p>
                <ul>
                  {content.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2>{isKorean ? '연락처' : 'Contact'}</h2>
        <p>{profileText.note}</p>
        <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
        <div className="recruiter-links">
          {profile.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {isKorean && link.url.includes('aussie-pus') ? '사이드프로젝트 게임' : isKorean && link.url.includes('github') ? 'GitHub' : link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
