// Route recommendation flow
'use server';
/**
 * @fileOverview A route recommendation AI agent.
 *
 * - routeRecommendation - A function that handles the route recommendation process.
 * - RouteRecommendationInput - The input type for the routeRecommendation function.
 * - RouteRecommendationOutput - The return type for the routeRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RouteRecommendationInputSchema = z.object({
  departureDistrict: z.string().describe('The departure district.'),
  arrivalDistrict: z.string().describe('The arrival district.'),
  travelDate: z.string().describe('The travel date (YYYY-MM-DD).'),
  numberOfPassengers: z.number().describe('The number of passengers.'),
  searchHistory: z.array(z.string()).describe('The user search history.'),
  busAvailability: z.string().describe('The current bus availability data.'),
});
export type RouteRecommendationInput = z.infer<typeof RouteRecommendationInputSchema>;

const RouteRecommendationOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      route: z.string().describe('The recommended route.'),
      time: z.string().describe('The recommended time.'),
      reason: z.string().describe('The reason for the recommendation.'),
    })
  ).describe('Alternative route and time recommendations.'),
});
export type RouteRecommendationOutput = z.infer<typeof RouteRecommendationOutputSchema>;

export async function routeRecommendation(input: RouteRecommendationInput): Promise<RouteRecommendationOutput> {
  return routeRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'routeRecommendationPrompt',
  input: {schema: RouteRecommendationInputSchema},
  output: {schema: RouteRecommendationOutputSchema},
  prompt: `You are a travel assistant providing alternative route and time recommendations.

  Based on the user's search history, current bus availability, and travel preferences,
  provide alternative route and time recommendations.

  Departure District: {{{departureDistrict}}}
  Arrival District: {{{arrivalDistrict}}}
  Travel Date: {{{travelDate}}}
  Number of Passengers: {{{numberOfPassengers}}}
  Search History: {{{searchHistory}}}
  Bus Availability: {{{busAvailability}}}

  Provide a list of alternative routes and times with a reason for each recommendation.
  Format the output in JSON.`,
});

const routeRecommendationFlow = ai.defineFlow(
  {
    name: 'routeRecommendationFlow',
    inputSchema: RouteRecommendationInputSchema,
    outputSchema: RouteRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
