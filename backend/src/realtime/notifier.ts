import { getIO } from './init.js';

/**
 * Sends a "Poke" signal to active devices for a specific user.
 *
 * @param userId - The unique ID of the user to notify.
 * @param excludeSocketId - (Optional) The socket ID of the device that initiated the action, to avoid redundant syncs.
 */
export const notifyUserUpdate = (userId: string, excludeSocketId?: string): void => {
  try {
    const io = getIO();
    let broadcast = io.to(`user:${userId}`);

    if (excludeSocketId) {
      broadcast = broadcast.except(excludeSocketId);
    }

    broadcast.emit('SYNC_POKE');

    if (excludeSocketId) {
      console.info(`[WebSocket] Poked user ${userId} (excluding ${excludeSocketId})`);
    } else {
      console.info(`[WebSocket] Poked user ${userId} (all devices)`);
    }
  } catch (error) {
    console.warn(`[WebSocket] Failed to poke user ${userId}:`, error);
  }
};
