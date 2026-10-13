import type { Competition, MediumType } from './types';

export function getCompetitionMedium(
  competition: Pick<Competition, 'category' | 'medium'>
): MediumType {
  if (
    competition.category === 'News Reading & Announcing'
    && competition.medium === 'None'
  ) {
    return 'Sinhala & English';
  }
  return competition.medium;
}
