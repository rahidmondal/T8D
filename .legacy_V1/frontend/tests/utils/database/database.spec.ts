import 'fake-indexeddb/auto';

import { Task, TaskStatus } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';
import {
  addTaskListToDb,
  addTaskToDb,
  deleteAllTaskListsFromDb,
  deleteAllTasksFromDb,
  deleteTaskFromDb,
  deleteTaskListFromDb,
  getAllTaskListsFromDb,
  getAllTasksFromDb,
  getTaskFromDb,
  getTaskListFromDb,
  getTasksByListIdFromDb,
  getTasksByParentFromDb,
  getTasksByStatusFromDb,
  updateTaskInDb,
  updateTaskListInDb,
} from '@src/utils/database/database';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const waitForDB = () => new Promise(resolve => setTimeout(resolve, 0));

const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  name: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.NOT_COMPLETED,
  createdAt: Date.now(),
  lastModified: Date.now(),
  dueDate: null,
  parentId: null,
  listId: 'list-1',
  order: Date.now(),
  hash: 'mock-hash',
  ...overrides,
});

const createMockTaskList = (overrides?: Partial<TaskList>): TaskList => ({
  id: 'list-1',
  name: 'Test List',
  description: 'Test Description',
  lastModified: Date.now(),
  order: Date.now(),
  hash: 'mock-hash',
  ...overrides,
});

describe('Database - Task Operations', () => {
  beforeEach(() => {
    global.indexedDB = new IDBFactory();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  });

  it('should add a task to the database', async () => {
    const task = createMockTask();
    const id = await addTaskToDb(task);

    expect(id).toBe(task.id);

    const retrieved = await getTaskFromDb(id);
    expect(retrieved).toEqual(task);
  });

  it('should get all tasks from the database', async () => {
    const task1 = createMockTask({ id: 'task-1' });
    const task2 = createMockTask({ id: 'task-2' });

    await addTaskToDb(task1);
    await addTaskToDb(task2);

    const tasks = await getAllTasksFromDb();
    expect(tasks).toHaveLength(2);
    expect(tasks).toEqual(expect.arrayContaining([task1, task2]));
  });

  it('should return undefined for non-existent task', async () => {
    const task = await getTaskFromDb('non-existent');
    expect(task).toBeUndefined();
  });

  it('should get tasks by status', async () => {
    const completedTask = createMockTask({ id: 'task-1', status: TaskStatus.COMPLETED });
    const notCompletedTask = createMockTask({ id: 'task-2', status: TaskStatus.NOT_COMPLETED });

    await addTaskToDb(completedTask);
    await addTaskToDb(notCompletedTask);
    await waitForDB();

    const completed = await getTasksByStatusFromDb(TaskStatus.COMPLETED);
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('task-1');
    expect(completed[0].status).toBe(TaskStatus.COMPLETED);
  });

  it('should get tasks by parentId', async () => {
    const parentTask = createMockTask({ id: 'parent-1', parentId: null });
    const childTask1 = createMockTask({ id: 'child-1', parentId: 'parent-1' });
    const childTask2 = createMockTask({ id: 'child-2', parentId: 'parent-1' });

    await addTaskToDb(parentTask);
    await addTaskToDb(childTask1);
    await addTaskToDb(childTask2);
    await waitForDB();

    const children = await getTasksByParentFromDb('parent-1');
    expect(children).toHaveLength(2);
    expect(children.map(t => t.id)).toEqual(expect.arrayContaining(['child-1', 'child-2']));
  });

  it('should get tasks by listId', async () => {
    const task1 = createMockTask({ id: 'task-1', listId: 'list-1' });
    const task2 = createMockTask({ id: 'task-2', listId: 'list-2' });
    const task3 = createMockTask({ id: 'task-3', listId: 'list-1' });

    await addTaskToDb(task1);
    await addTaskToDb(task2);
    await addTaskToDb(task3);
    await waitForDB();

    const listTasks = await getTasksByListIdFromDb('list-1');
    expect(listTasks).toHaveLength(2);
    expect(listTasks.map(t => t.id)).toEqual(expect.arrayContaining(['task-1', 'task-3']));
  });

  it('should update a task', async () => {
    const task = createMockTask();
    await addTaskToDb(task);

    const updatedTask = { ...task, name: 'Updated Name', status: TaskStatus.COMPLETED };
    await updateTaskInDb(updatedTask);

    const retrieved = await getTaskFromDb(task.id);
    expect(retrieved?.name).toBe('Updated Name');
    expect(retrieved?.status).toBe(TaskStatus.COMPLETED);
  });

  it('should delete a task', async () => {
    const task = createMockTask();
    await addTaskToDb(task);

    await deleteTaskFromDb(task.id);

    const retrieved = await getTaskFromDb(task.id);
    expect(retrieved).toBeUndefined();
  });

  it('should delete all tasks', async () => {
    await addTaskToDb(createMockTask({ id: 'task-1' }));
    await addTaskToDb(createMockTask({ id: 'task-2' }));
    await addTaskToDb(createMockTask({ id: 'task-3' }));

    await deleteAllTasksFromDb();

    const tasks = await getAllTasksFromDb();
    expect(tasks).toHaveLength(0);
  });
});

describe('Database - TaskList Operations', () => {
  beforeEach(() => {
    global.indexedDB = new IDBFactory();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  });

  it('should add a task list to the database', async () => {
    const list = createMockTaskList();
    const id = await addTaskListToDb(list);

    expect(id).toBe(list.id);

    const retrieved = await getTaskListFromDb(id);
    expect(retrieved).toEqual(list);
  });

  it('should get all task lists ordered by order field', async () => {
    const list1 = createMockTaskList({ id: 'list-1', order: 3 });
    const list2 = createMockTaskList({ id: 'list-2', order: 1 });
    const list3 = createMockTaskList({ id: 'list-3', order: 2 });

    await addTaskListToDb(list1);
    await addTaskListToDb(list2);
    await addTaskListToDb(list3);
    await waitForDB();

    const lists = await getAllTaskListsFromDb();
    expect(lists).toHaveLength(3);
    expect(lists[0].id).toBe('list-2');
    expect(lists[1].id).toBe('list-3');
    expect(lists[2].id).toBe('list-1');
  });

  it('should return undefined for non-existent task list', async () => {
    const list = await getTaskListFromDb('non-existent');
    expect(list).toBeUndefined();
  });

  it('should update a task list', async () => {
    const list = createMockTaskList();
    await addTaskListToDb(list);

    const updatedList = { ...list, name: 'Updated List', description: 'New Description' };
    await updateTaskListInDb(updatedList);

    const retrieved = await getTaskListFromDb(list.id);
    expect(retrieved?.name).toBe('Updated List');
    expect(retrieved?.description).toBe('New Description');
  });

  it('should delete a task list', async () => {
    const list = createMockTaskList();
    await addTaskListToDb(list);

    await deleteTaskListFromDb(list.id);

    const retrieved = await getTaskListFromDb(list.id);
    expect(retrieved).toBeUndefined();
  });

  it('should delete all task lists', async () => {
    await addTaskListToDb(createMockTaskList({ id: 'list-1' }));
    await addTaskListToDb(createMockTaskList({ id: 'list-2' }));
    await addTaskListToDb(createMockTaskList({ id: 'list-3' }));

    await deleteAllTaskListsFromDb();

    const lists = await getAllTaskListsFromDb();
    expect(lists).toHaveLength(0);
  });
});
