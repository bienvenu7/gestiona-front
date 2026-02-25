export interface IUploadInterfaceFromFileSokect {
  processed: number;
  total: number;
  failed: number;
  percentage: number;
}

export interface IProducts {
  companyId: string;
  name: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  id?: string;
}

export interface ICart {
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

export interface ICreateOrder {
  order: {
    companyId: string;
    clientId: string;
    totalAmount: number;
  };
  carts: ICart[];
}

export interface IOrder {
  createdAt: Date;
  totalAmount: number;
  orderNumber: string;
  status: "FINISH" | "WAITING" | "CANCEL" | "PARTIAL";
  paidAmount: number;
  products: {
    productName: string;
    quantity: number;
  }[];
}

export interface IPayementResponse {
  id: string;
  companyId: string;
  type: "COMPLET" | "ECHEANCE";
  orderNumber: string;
  amountPaid: number;
  paymentDate: Date;
  paymentNumber: string;
}

export interface IPaymentData {
  companyId: string;
  type: "COMPLET" | "ECHEANCE";
  orderNumber: string;
  amountPaid: number;
}
