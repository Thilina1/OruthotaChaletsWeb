'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized recommendations for hotel guests.
 *
 * The flow takes guest preferences as input and returns a list of recommended attractions and activities.
 *
 * @exported
 * - `generatePersonalizedRecommendations` -  A function that generates personalized recommendations.
 * - `PersonalizedRecommendationsInput` - The input type for the generatePersonalizedRecommendations function.
 * - `PersonalizedRecommendationsOutput` - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  guestPreferences: z
    .string()
    .describe('A description of the guest\u0027s preferences and interests.'),
  guestHistory: z
    .string()
    .optional()
    .describe('A summary of the guest\u0027s previous stays and activities.'),
});

export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A list of personalized recommendations for local attractions and activities.'),
});

export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are a personalized recommendation engine for hotel guests. Given the guest\u0027s preferences and history, provide a list of recommendations for local attractions and activities.

Guest Preferences: {{{guestPreferences}}}
Guest History: {{{guestHistory}}}

Recommendations:`, 
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);

export async function generatePersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}
