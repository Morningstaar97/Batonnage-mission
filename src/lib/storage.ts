import { LocalUser } from '../types';

// Storage Keys
const STORAGE_USER_KEY = 'sinisync_user';
const STORAGE_MISSIONS_KEY = 'sinisync_missions';

export const getLocalUser = (): LocalUser | null => {
  const data = localStorage.getItem(STORAGE_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setLocalUser = (user: LocalUser | null) => {
  if (user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_USER_KEY);
  }
};

export const getLocalMissions = (): any[] => {
  const data = localStorage.getItem(STORAGE_MISSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLocalMissions = (missions: any[]) => {
  localStorage.setItem(STORAGE_MISSIONS_KEY, JSON.stringify(missions));
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
