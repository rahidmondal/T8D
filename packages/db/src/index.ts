import { type Task, type TaskList } from '@t8d/sdk';
import Dexie, { type Table } from 'dexie';
import { Subject } from 'rxjs';

export class T8DDatabase extends Dexie {
  tasks!: Table<Task, string>;
  taskLists!: Table<TaskList, string>;

  constructor() {
    super('T8DDatabase');
    this.version(1).stores({
      tasks: 'id',
      taskLists: 'id',
    });
  }
}

export const onChanges$ = new Subject<any>();
