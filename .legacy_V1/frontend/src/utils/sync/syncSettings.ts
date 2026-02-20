const SYNC_ENABLED_KEY = 't8d-sync-enabled';
const SYNC_INTERVAL_MINUTES = 5;
const DEFAULT_SYNC_INTERVAL = SYNC_INTERVAL_MINUTES * 60 * 1000;

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
