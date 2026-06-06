interface CreateNotificationParams {
    userId: string;
    type: string;
    title: string;
    message: string;
    entityId?: string;
    entityType?: string;
}
declare const createNotification: (params: CreateNotificationParams) => Promise<void>;
export default createNotification;
//# sourceMappingURL=notification.service.d.ts.map