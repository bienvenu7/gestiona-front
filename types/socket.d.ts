interface IUploadInterfaceFromFileSokect {
  processed: number;
  total: number;
  failed: number;
  percentage: number;
}

interface IProducts {
  companyId: string;
  name: string;
  sku?: string;
  price: number;
  stockQuantity: number;
}
