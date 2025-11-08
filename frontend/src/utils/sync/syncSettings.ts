const SYNC_ENABLED_KEY = 't8d-sync-enabled';

export const getSyncEnabled = (): boolean => {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setSyncEnabled = (isEnabled: boolean): void => {
  localStorage.setItem(SYNC_ENABLED_KEY, String(isEnabled));
};
