import * as migration_20260930_172928_initial from './20260930_172928_initial';

export const migrations = [
  {
    up: migration_20260930_172928_initial.up,
    down: migration_20260930_172928_initial.down,
    name: '20260930_172928_initial'
  },
];
