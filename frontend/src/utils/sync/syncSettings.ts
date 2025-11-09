const SYNC_ENABLED_KEY = 't8d-sync-enabled';
const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000;

export const getSyncEnabled = (): boolean => {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setSyncEnabled = (isEnabled: boolean): void => {
  try {
    localStorage.setItem(SYNC_ENABLED_KEY, String(isEnabled));
  } catch (error) {
    console.warn('Failed to save sync setting to localStorage', error);
  }
};

export const isAutoSyncEnabled = (): boolean => {
  return getSyncEnabled();
};

export const getSyncInterval = (): number => {
  return DEFAULT_SYNC_INTERVAL;
};
