import type { PortfolioMilestone } from '../data/portfolioTimeline';

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
  emitMilestoneOpen(payload: MilestoneOpenEvent) {
    this.dispatchEvent(new CustomEvent<MilestoneOpenEvent>('milestone-open', { detail: payload }));
  }

  emitSkills(payload: SkillsEvent) {
    this.dispatchEvent(new CustomEvent<SkillsEvent>('skills-change', { detail: payload }));
  }

  emitChapter(index: number) {
    this.dispatchEvent(new CustomEvent<number>('chapter-change', { detail: index }));
  }

  emitPortalReady(index: number) {
    this.dispatchEvent(new CustomEvent<number>('portal-ready', { detail: index }));
  }

  resumeGame() {
    this.dispatchEvent(new Event('resume-game'));
  }

  nextChapter() {
    this.dispatchEvent(new Event('next-chapter'));
  }
}

export const gameEvents = new GameEvents();
