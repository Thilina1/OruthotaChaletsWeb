'use server';

/**
 * @fileOverview AI-generated descriptions and popular choices for hotel amenities.
 *
 * - getAmenityDescription - A function that generates descriptions and recommendations for amenities.
 * - AmenityDescriptionInput - The input type for the getAmenityDescription function.
 * - AmenityDescriptionOutput - The return type for the getAmenityDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AmenityDescriptionInputSchema = z.object({
  amenityName: z.string().describe('The name of the amenity (e.g., restaurant name or bar name).'),
  amenityType: z.enum(['restaurant', 'bar', 'spa', 'gym', 'pool']).describe('The type of amenity.'),
  guestHistory: z.string().optional().describe('A summary of the guest history and preferences.'),
});
export type AmenityDescriptionInput = z.infer<typeof AmenityDescriptionInputSchema>;

const AmenityDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed and engaging AI-generated description of the amenity.'),
  popularChoices: z.string().describe('AI-generated recommendations for popular choices at the amenity, considering guest history when available.'),
});
export type AmenityDescriptionOutput = z.infer<typeof AmenityDescriptionOutputSchema>;

export async function getAmenityDescription(input: AmenityDescriptionInput): Promise<AmenityDescriptionOutput> {
  return amenityDescriptionFlow(input);
}

const amenityDescriptionPrompt = ai.definePrompt({
  name: 'amenityDescriptionPrompt',
  input: {schema: AmenityDescriptionInputSchema},
  output: {schema: AmenityDescriptionOutputSchema},
  prompt: `You are a hotel concierge expert at describing hotel amenities to guests.

  Generate a compelling description of the {{amenityName}} which is a {{amenityType}} in the hotel.

  If available, consider the guest's history: {{{guestHistory}}}.  Otherwise, provide generally popular choices.

  Output the description, and popular choices in distinct sections.
  `,
});

const amenityDescriptionFlow = ai.defineFlow(
  {
    name: 'amenityDescriptionFlow',
    inputSchema: AmenityDescriptionInputSchema,
    outputSchema: AmenityDescriptionOutputSchema,
  },
  async input => {
    const {output} = await amenityDescriptionPrompt(input);
    return output!;
  }
);
