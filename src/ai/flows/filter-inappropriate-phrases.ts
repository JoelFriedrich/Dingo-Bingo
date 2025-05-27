// This is an AI-powered profanity filter for bingo phrases.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterInappropriatePhrasesInputSchema = z.object({
  phrases: z.array(z.string()).describe('An array of bingo phrases to filter.'),
  theme: z.string().describe('The theme of the bingo game.'),
});
export type FilterInappropriatePhrasesInput = z.infer<
  typeof FilterInappropriatePhrasesInputSchema
>;

const FilterInappropriatePhrasesOutputSchema = z.object({
  relevantPhrases: z
    .array(z.string())
    .describe('An array of bingo phrases that are relevant to the theme.'),
  inappropriatePhrases: z
    .array(z.string())
    .describe('An array of bingo phrases that are inappropriate for the game.'),
});
export type FilterInappropriatePhrasesOutput = z.infer<
  typeof FilterInappropriatePhrasesOutputSchema
>;

export async function filterInappropriatePhrases(
  input: FilterInappropriatePhrasesInput
): Promise<FilterInappropriatePhrasesOutput> {
  return filterInappropriatePhrasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterInappropriatePhrasesPrompt',
  input: {schema: FilterInappropriatePhrasesInputSchema},
  output: {schema: FilterInappropriatePhrasesOutputSchema},
  prompt: `You are a content filter for a digital Bingo game.

You will receive a list of phrases and a theme. You must evaluate each phrase to determine if it is relevant to the theme and appropriate for all ages.

Theme: {{{theme}}}
Phrases: {{#each phrases}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return two lists:
- relevantPhrases: Phrases that are relevant to the theme and appropriate.
- inappropriatePhrases: Phrases that are not relevant to the theme or are inappropriate.

Ensure that the \"relevantPhrases\" only includes phrases that closely align with the specified theme, and that the \"inappropriatePhrases\" list contains any phrase that could be considered offensive, harmful, or unrelated to the game.\n
Output in JSON format:
{{outputFormat schema=FilterInappropriatePhrasesOutputSchema}}`,
});

const filterInappropriatePhrasesFlow = ai.defineFlow(
  {
    name: 'filterInappropriatePhrasesFlow',
    inputSchema: FilterInappropriatePhrasesInputSchema,
    outputSchema: FilterInappropriatePhrasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
