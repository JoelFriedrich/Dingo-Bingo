import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

config(); // Load .env variables

export const ai = genkit({
  plugins: [googleAI()],
  // You might want to specify a default model if not done elsewhere or for specific flows
  // model: 'googleai/gemini-1.5-flash-latest', 
});
