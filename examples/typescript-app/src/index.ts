import { loadConfig } from './config/env';
import { createTaskRepository } from './repositories/task-repository';
import { createUserRepository } from './repositories/user-repository';
import { TaskService } from './services/task-service';
import { UserService } from './services/user-service';
import { createLogger } from './utils/logger';

/**
 * Wires the repositories and services together and runs a short demo flow.
 */
export function main(): void {
  const config = loadConfig();
  const logger = createLogger('main');

  logger.info('starting up', { logLevel: config.logLevel, maxTasksPerUser: config.maxTasksPerUser });

  const users = createUserRepository();
  const tasks = createTaskRepository();
  const userService = new UserService(users);
  const taskService = new TaskService(tasks, users);

  const now = new Date();
  const registration = userService.register({ email: 'ada@example.com', name: 'Ada Lovelace' }, now);

  if (!registration.ok) {
    logger.error('registration failed', { reason: registration.error.message });

    return;
  }

  const created = taskService.create(
    { assigneeId: registration.value.id, priority: 'high', title: 'Write the analytical engine notes' },
    now,
  );

  if (!created.ok) {
    logger.error('task creation failed', { reason: created.error.message });

    return;
  }

  taskService.changeStatus(created.value.id, 'in_progress');

  const assigned = taskService.listForUser(registration.value.id);

  logger.info('demo complete', { assignedTaskCount: assigned.length, userCount: userService.listUsers().length });
}

main();
