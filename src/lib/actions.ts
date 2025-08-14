'use server';

import { prioritizeTasks } from "@/ai/flows/prioritize-tasks";
import { Task } from "./types";

export async function runPrioritizeTasks(tasks: Task[]): Promise<Task[]> {
  try {
    const aiInput = {
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimatedPomodoros: task.estimatedPomodoros,
        completedPomodoros: task.completedPomodoros,
      })),
      userWorkingPatterns: "I prefer to work on complex tasks in the morning and easier tasks in the afternoon.",
    };

    const prioritizedList = await prioritizeTasks(aiInput);

    // This merges the AI output with the original tasks to preserve all fields
    const updatedTasks = tasks.map(originalTask => {
      const aiTask = prioritizedList.find(p => p.id === originalTask.id);
      if (aiTask) {
        return { ...originalTask, ...aiTask };
      }
      return originalTask;
    });

    return updatedTasks;

  } catch (error) {
    console.error("Error prioritizing tasks:", error);
    // In case of an error, return the original tasks to avoid breaking the UI
    return tasks;
  }
}
