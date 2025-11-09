import { getIO } from './init.js';

/**
 * Sends a "Poke" signal to all active devices for a specific user.
 * This tells the client apps to wake up and perform a standard REST sync.
 *
 * @param userId - The unique ID of the user to notify.
 */
export const notifyUserUpdate = (userId: string): void => {
  try {
    const io = getIO();

    io.to(`user:${userId}`).emit('SYNC_POKE');

    console.info(`[WebSocket] Poked user ${userId}`);
  } catch (error) {
    console.warn(`[WebSocket] Failed to poke user ${userId}:`, error);
  }
};
