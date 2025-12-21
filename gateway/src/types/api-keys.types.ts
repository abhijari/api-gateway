export type ApiKeyResponse = {
    id: string;
    key: string;
    userId: string;
    userEmail: string;
    active: boolean;
    limitPerMinute: number;
    limitPerDay: number;
    createdAt: Date;
};
  