// ============================================================
// NOTIFICATION SERVICE STUB
// Future: WebSocket / Supabase Realtime / Push notifications
// ============================================================

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
}

/**
 * Notification service — currently delegates to ProcurementContext.
 * Future: integrate with Supabase Realtime, Firebase FCM, or WebSocket.
 */
export const notificationService = {
  /**
   * Future: POST /api/notifications
   * Future: Supabase Realtime broadcast
   */
  async send(_payload: NotificationPayload): Promise<void> {
    // TODO: supabase.channel('notifications').send({ type: 'broadcast', event: 'notification', payload })
    console.warn("notificationService.send: not yet connected to backend.");
  },

  /**
   * Future: WebSocket subscription for live notifications
   */
  subscribe(_userId: string, _onMessage: (payload: NotificationPayload) => void): () => void {
    // TODO: supabase.channel('notifications').on('broadcast', ...).subscribe()
    console.warn("notificationService.subscribe: not yet connected.");
    return () => {}; // unsubscribe
  },
};
