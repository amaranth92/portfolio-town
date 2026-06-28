import { useEffect, useState } from 'react';
import { PortfolioPopup } from './components/PortfolioPopup';
import { Version2Portfolio } from './components/Version2Portfolio';
import type { PortfolioMilestone } from './data/portfolioTimeline';
import { gameEvents, type Locale, type MilestoneOpenEvent } from './game/gameEvents';

function App() {
  const isPrivacyPolicy = window.location.pathname.replace(/\/+$/, '') === '/privacy-policy-car-park-dash';
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = window.localStorage.getItem('portfolio-locale');
    return saved === 'ko' || saved === 'en' ? saved : 'en';
  });
  const isKorean = locale === 'ko';
  const [activeMilestone, setActiveMilestone] = useState<PortfolioMilestone | null>(null);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<MilestoneOpenEvent>).detail;
      setActiveMilestone((current: PortfolioMilestone | null) => current ?? detail.milestone);
    };
    const resume = () => setActiveMilestone(null);

    gameEvents.addEventListener('milestone-open', open);
    gameEvents.addEventListener('resume-game', resume);
    return () => {
      gameEvents.removeEventListener('milestone-open', open);
      gameEvents.removeEventListener('resume-game', resume);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem('portfolio-locale', locale);
    gameEvents.emitLanguageChange(locale);
  }, [locale]);

  useEffect(() => {
    if (!activeMilestone) return undefined;

    const closeWithKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') gameEvents.resumeGame();
    };

    window.addEventListener('keydown', closeWithKey);
    return () => {
      window.removeEventListener('keydown', closeWithKey);
    };
  }, [activeMilestone]);

  if (isPrivacyPolicy) return <PrivacyPolicy />;

  return (
    <div className="app-shell">
      <Version2Portfolio
        locale={locale}
        onToggleLocale={() => setLocale((value) => (value === 'ko' ? 'en' : 'ko'))}
      />
      <PortfolioPopup milestone={activeMilestone} isKorean={isKorean} />
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <section className="privacy-card">
        <p className="privacy-kicker">Aussie Pus Studio</p>
        <h1>Car Park Dash Privacy Policy</h1>
        <p className="privacy-date">Last updated: June 6, 2026</p>
        <p>
          Car Park Dash respects your privacy. The game does not require account registration and does not collect or store
          directly identifying information such as your name, phone number, or email address on servers operated by us.
        </p>
        <h2>Information That May Be Processed</h2>
        <ul>
          <li>Advertising identifier, device information, OS version, app version, ad impressions, ad clicks, and rewarded-ad completion records.</li>
          <li>Local game data such as settings, stage progress, owned items, sound preferences, and tutorial state.</li>
          <li>Crash logs or performance diagnostics when provided by the platform or SDK providers.</li>
        </ul>
        <h2>How Information Is Used</h2>
        <ul>
          <li>To provide advertising through Google AdMob and Google Mobile Ads.</li>
          <li>To measure ad performance and grant rewards for rewarded advertisements.</li>
          <li>To save game progress, keep preferences, improve gameplay quality, and troubleshoot issues.</li>
        </ul>
        <h2>Third-Party Services</h2>
        <p>
          The game may use Google AdMob / Google Mobile Ads for advertising. Google processes data according to the
          <a href="https://policies.google.com/privacy"> Google Privacy Policy</a>.
        </p>
        <h2>Retention And Deletion</h2>
        <p>
          We do not store personal information on our own servers. Local game data can be removed by uninstalling the app
          or clearing app storage. Data processed by advertising providers is retained and deleted according to their policies.
        </p>
        <h2>Children</h2>
        <p>
          The game is not directed to children under 13. If a parent or guardian has questions about a child's data,
          please use the support contact shown on the app store listing.
        </p>
        <h2>Your Choices</h2>
        <p>
          You can reset your advertising identifier, limit personalized ads, change app permissions, or uninstall the app
          through your device settings. Where required by region, you may choose or change ad consent in the consent screen.
        </p>
        <h2>Contact</h2>
        <p>Please use the developer support contact shown on the Google Play or App Store listing.</p>
      </section>
    </main>
  );
}

export default App;
