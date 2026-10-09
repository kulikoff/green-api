export type IncomingTextMessage = {
  idMessage: string;
  chatId: string;
  phone: string | null;
  senderName: string | null;
  text: string;
  createdAt: number;
};

export type ReceivedNotification = {
  receiptId: number;
  body: unknown;
};
