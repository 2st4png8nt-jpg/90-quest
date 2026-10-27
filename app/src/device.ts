// Phone features: one daily reminder and a light haptic tap. Both are no-ops on web.
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from './game';

const native = Platform.OS === 'ios' || Platform.OS === 'android';

if (native) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export function tap() {
  if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
export function success() {
  if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/**
 * Replace any scheduled reminder with one informational daily notification (docs/ENGAGEMENT.md, change 2).
 * Returns false if the phone denied permission, so the UI can say so.
 */
export async function scheduleReminder(reminder: Reminder, body: string): Promise<boolean> {
  if (!native) return true;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!reminder) return true;
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily', { name: 'Daily reminder', importance: Notifications.AndroidImportance.DEFAULT });
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: "Today's quest is ready", body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: reminder.hour, minute: reminder.minute, channelId: 'daily' },
    });
    return true;
  } catch {
    return false;
  }
}

export function formatTime(r: { hour: number; minute: number }) {
  const h = r.hour % 12 || 12;
  return `${h}:${String(r.minute).padStart(2, '0')} ${r.hour < 12 ? 'AM' : 'PM'}`;
}
