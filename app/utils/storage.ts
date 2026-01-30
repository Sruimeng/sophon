import { CommonStorage } from '../constants/static/storage';

type S<T> = T extends Record<string, any> ? T | null : string | null;

export const setCommonStorage = (key: CommonStorage, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getCommonStorage = <T>(key: CommonStorage): S<T> | null => {
  const stringData = localStorage.getItem(key);
  if (!stringData) {
    return null;
  }
  try {
    return JSON.parse(stringData);
  } catch {
    return null;
  }
};

export const removeCommonStorage = (key: CommonStorage) => {
  localStorage.removeItem(key);
};

const getPrefix = () => {
  const userInfo = getCommonStorage<{ detail: { userId: string } }>(CommonStorage.UserDetail);
  if (userInfo) {
    return userInfo.detail.userId;
  } else {
    return '';
  }
};

export const getStorage = <T>(key: Storage): S<T> | null => {
  const prefix = getPrefix();
  const stringData = localStorage.getItem(key + prefix);
  if (!stringData) {
    return null;
  }
  try {
    return JSON.parse(stringData);
  } catch {
    return null;
  }
};

export const setStorage = (key: Storage, value: unknown) => {
  const prefix = getPrefix();
  localStorage.setItem(key + prefix, JSON.stringify(value));
};

export const removeStorage = (key: Storage) => {
  const prefix = getPrefix();
  localStorage.removeItem(key + prefix);
};
