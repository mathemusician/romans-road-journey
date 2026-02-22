import { Mastra } from '@mastra/core';
import { bibleAgent } from './agents/bible-agent';

export const mastra = new Mastra({
  agents: { bibleAgent },
});
