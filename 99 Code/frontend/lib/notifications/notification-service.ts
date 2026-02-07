import { toast } from 'sonner';

class NotificationService {
  notifySuccess(message: string) {
    toast.success(message);
  }

  notifyError(message: string) {
    toast.error(message);
  }

  notifyInfo(message: string) {
    toast.info(message);
  }
}

export const notificationService = new NotificationService();
