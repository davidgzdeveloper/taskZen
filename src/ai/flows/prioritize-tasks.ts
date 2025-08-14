'use server';

/**
 * @fileOverview An AI-powered task prioritization tool.
 *
 * - prioritizeTasks - A function that handles the task prioritization process.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      estimatedPomodoros: z.number().optional(),
      completedPomodoros: z.number().optional(),
    })
  ).describe('An array of tasks to prioritize.'),
  userWorkingPatterns: z.string().optional().describe('The user working patterns.'),
});

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']),
    estimatedPomodoros: z.number().optional(),
    completedPomodoros: z.number().optional(),
  })
).describe('An array of tasks with updated priorities.');

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI-powered task prioritization expert. Analyze the following tasks and user working patterns to recommend the best priority for each task.

Tasks:
{{#each tasks}}
- ID: {{this.id}}
  Title: {{this.title}}
  Description: {{this.description}}
  Priority: {{this.priority}}
  Estimated Pomodoros: {{this.estimatedPomodoros}}
  Completed Pomodoros: {{this.completedPomodoros}}
{{/each}}

User Working Patterns: {{userWorkingPatterns}}

Re-rank and re-prioritize the tasks based on the provided information. Return the tasks with updated priorities.
Make sure that the output contains all the fields from the input.  If the input task has a missing field (for example estimatedPomodoros) then you should not set it in the output.

Ensure the response is a valid JSON array of tasks.
`, // Ensure valid JSON format
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
