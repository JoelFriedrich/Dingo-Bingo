
'use server';
/**
 * @fileOverview An AI flow to generate bingo phrases based on a theme.
 *
 * - generateBingoPhrases - A function that handles the bingo phrase generation process.
 * - GenerateBingoPhrasesInput - The input type for the generateBingoPhrases function.
 * - GenerateBingoPhrasesOutput - The return type for the generateBingoPhrases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBingoPhrasesInputSchema = z.object({
  theme: z.string().describe('The theme or prompt for generating bingo phrases. For example: "Summer Vacation", "Office Life", "Fantasy Adventure".'),
  count: z.number().optional().default(25).describe('The desired number of unique bingo phrases to generate.'),
});
export type GenerateBingoPhrasesInput = z.infer<typeof GenerateBingoPhrasesInputSchema>;

const GenerateBingoPhrasesOutputSchema = z.object({
  phrases: z
    .array(z.string())
    .describe('An array of generated bingo phrases that are relevant to the theme, unique, short (2-4 words), and appropriate for all ages.'),
});
export type GenerateBingoPhrasesOutput = z.infer<typeof GenerateBingoPhrasesOutputSchema>;

export async function generateBingoPhrases(
  input: GenerateBingoPhrasesInput
): Promise<GenerateBingoPhrasesOutput> {
  return generateBingoPhrasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBingoPhrasesPrompt',
  input: {schema: GenerateBingoPhrasesInputSchema},
  output: {schema: GenerateBingoPhrasesOutputSchema},
  prompt: `You are an expert at creating fun and engaging content for Bingo games.

Given a theme, please generate a list of {{{count}}} unique bingo phrases. Each phrase should be:
1.  Directly relevant to the theme: {{{theme}}}.
2.  Short, ideally 2-4 words.
3.  Appropriate for all ages (no offensive, harmful, or adult content).
4.  Distinct and not too repetitive.

Please provide the output as a JSON object matching the specified output schema.
Output format:
{{outputFormat schema=GenerateBingoPhrasesOutputSchema}}`,
  // You might want to use a model that's good at creative text generation and following instructions.
  // model: 'gemini-1.5-pro-latest', // Or 'gemini-1.5-flash-latest' for speed
   model: 'googleai/gemini-1.5-flash-latest', // Ensure this model is available and suitable
   config: {
    temperature: 0.7, // Adjust for creativity vs. predictability
   }
});

const generateBingoPhrasesFlow = ai.defineFlow(
  {
    name: 'generateBingoPhrasesFlow',
    inputSchema: GenerateBingoPhrasesInputSchema,
    outputSchema: GenerateBingoPhrasesOutputSchema,
  },
  async (input) => {
    // Ensure a default count if not provided, or clamp it if necessary.
    const validatedInput = { ...input, count: input.count || 25 };
    
    try {
      const {output} = await prompt(validatedInput);
      if (!output || !output.phrases) {
        // This specific error is already handled by the client-side catch block if AI returns empty/invalid
        throw new Error('AI failed to generate phrases or returned an invalid format.');
      }
      return output;
    } catch (flowError) {
      // Log the detailed error on the server-side (Next.js console)
      console.error('[DingoBingo] Error within generateBingoPhrasesFlow:', flowError);
      
      // Re-throw a new error that might be more informative to the client
      // The client-side toast will pick up `error.message`
      if (flowError instanceof Error) {
        // Prepend a clear marker to the error message
        throw new Error(`AI Service Error: ${flowError.message}`);
      }
      // Fallback for non-Error objects thrown
      throw new Error('An unexpected error occurred while communicating with the AI service.');
    }
  }
);

