import type { PortfolioMilestone } from '../data/portfolioTimeline';

export type Locale = 'en' | 'ko';

export type MilestoneOpenEvent = {
  milestone: PortfolioMilestone;
  index: number;
};

export type SkillsEvent = {
  skills: string[];
  chapterIndex: number;
  viewedIds: string[];
};

class GameEvents extends EventTarget {
  // Phaser -> React: 플레이어가 ! 블록을 열었을 때 팝업에 표시할 마일스톤을 전달합니다.
  emitMilestoneOpen(payload: MilestoneOpenEvent) {
    this.dispatchEvent(new CustomEvent<MilestoneOpenEvent>('milestone-open', { detail: payload }));
  }

  // Phaser -> React: 수집된 기술 목록과 현재 챕터를 HUD에 동기화합니다.
  emitSkills(payload: SkillsEvent) {
    this.dispatchEvent(new CustomEvent<SkillsEvent>('skills-change', { detail: payload }));
  }

  // Phaser -> React: 카메라 진행 위치가 다른 챕터로 넘어갈 때 현재 챕터 번호를 알립니다.
  emitChapter(index: number) {
    this.dispatchEvent(new CustomEvent<number>('chapter-change', { detail: index }));
  }

  emitPortalReady(index: number) {
    this.dispatchEvent(new CustomEvent<number>('portal-ready', { detail: index }));
  }

  emitLanguageChange(locale: Locale) {
    this.dispatchEvent(new CustomEvent<Locale>('language-change', { detail: locale }));
  }

  // React -> Phaser: 팝업을 닫고 일시정지된 씬을 재개합니다.
  resumeGame() {
    this.dispatchEvent(new Event('resume-game'));
  }

  // 향후 포털/챕터 이동 UI에서 사용할 수 있도록 남겨둔 명령 이벤트입니다.
  nextChapter() {
    this.dispatchEvent(new Event('next-chapter'));
  }
}

export const gameEvents = new GameEvents();
