export enum PaymentStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Payment {
  id: string;
  ticketId: string;
  amount: string;
  status: PaymentStatus;
  pixReceiptUrl?: string;
  rejectionReason?: string;
  expiresAt: string;
  uploadedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  ticket?: {
    id: string;
    code: string;
    finalPrice: string;
    client?: {
      id: string;
      name: string;
      email: string;
      cpf: string;
    };
    ticketType?: {
      id: string;
      name: string;
      event?: {
        id: string;
        title: string;
      };
    };
  };
}
