import { comparePriority } from '@domain/priority';
import { createTask, type NewTask, type Task, type TaskStatus, withStatus } from '@domain/task';

import { NotFoundError } from '@errors/app-error';

import type { TaskRepository } from '@repositories/task-repository';
import type { UserRepository } from '@repositories/user-repository';

import { failure, type Result, success } from '@utils/result';

/** Coordinates task creation, assignment, and status changes. */
export class TaskService {
  private readonly tasks: TaskRepository;

  private readonly users: UserRepository;

  /**
   * Creates the service.
   * @param tasks - The backing task repository.
   * @param users - The user repository, used to validate assignees.
   */
  public constructor(tasks: TaskRepository, users: UserRepository) {
    this.tasks = tasks;
    this.users = users;
  }

  /**
   * Creates a task, validating the assignee exists when one is supplied.
   * @param input - The title, priority, and optional assignee.
   * @param now - The creation timestamp.
   * @returns The created task, or a not-found error for an unknown assignee.
   */
  public create(input: NewTask, now: Date): Result<Task, NotFoundError> {
    if (input.assigneeId !== undefined && this.users.findById(input.assigneeId) === undefined) {
      return failure(new NotFoundError('User', input.assigneeId));
    }

    const task = createTask(input, now);

    this.tasks.save(task);

    return success(task);
  }

  /**
   * Moves a task into a new lifecycle status.
   * @param taskId - The identifier of the task to transition.
   * @param status - The status to move the task into.
   * @returns The updated task, or a not-found error.
   */
  public changeStatus(taskId: string, status: TaskStatus): Result<Task, NotFoundError> {
    const existing = this.tasks.findById(taskId);

    if (existing === undefined) {
      return failure(new NotFoundError('Task', taskId));
    }

    const updated = withStatus(existing, status);

    this.tasks.save(updated);

    return success(updated);
  }

  /**
   * Lists a user's tasks, most urgent first.
   * @param assigneeId - The identifier of the assignee.
   * @returns The assignee's tasks sorted by descending priority.
   */
  public listForUser(assigneeId: string): Task[] {
    return this.tasks.listByAssignee(assigneeId).toSorted((first, second) => comparePriority(first.priority, second.priority));
  }
}
