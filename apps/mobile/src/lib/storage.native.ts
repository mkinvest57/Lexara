import Storage from 'expo-sqlite/kv-store';
import type { StorageAdapter } from './storage';

export const productStorage: StorageAdapter = {
  getItem: (key) => Storage.getItem(key),
  setItem: (key, value) => Storage.setItem(key, value),
  removeItem: (key) => Storage.removeItem(key),
};
