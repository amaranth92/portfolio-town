import { portfolioTimeline, profile } from '../data/portfolioTimeline';

export function RecruiterMode() {
  const allSkills = [...new Set(portfolioTimeline.flatMap((item) => item.skills))];

  return (
    <main className="recruiter-mode">
      <section className="recruiter-hero">
        <p>{profile.location}</p>
        <h1>{profile.name}</h1>
        <strong>{profile.headline}</strong>
        <span>{profile.experience}</span>
      </section>

      <section>
        <h2>Core skills</h2>
        <div className="recruiter-skills">
          {allSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section>
        <h2>Timeline</h2>
        <div className="recruiter-timeline">
          {portfolioTimeline.map((item) => (
            <article key={item.id}>
              <span>{item.year}</span>
              <h3>{item.title}</h3>
              <strong>{item.subtitle}</strong>
              <p>{item.summary}</p>
              <ul>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <p>{profile.contact.note}</p>
        <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
      </section>
    </main>
  );
}
