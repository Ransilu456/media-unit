import type { Metadata } from 'next';
import { ExploreExperience } from './ExploreExperience';

export const metadata: Metadata = {
  title: 'Explore Agradhi Media | Saranath College',
  description: 'Meet the creators, storytellers, and student media artists of Agradhi Media Unit at Saranath College.',
};

export default function Test() {
  return <ExploreExperience />;
}