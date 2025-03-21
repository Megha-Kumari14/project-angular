

export interface Product{
    ProductID: number;
    Name: string;
    Description: string;
    SKU: number;
    CategoryID: number;
    StockQuantity: number;
    Price: number;
    Currency: string;

}

export interface Product
{
    productID: number;
    name: string;
    description: string;
    sku: string;
    categoryID: number;
    categoryName?: string;
    stockQuantity: number;
    price: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}



export interface Category {
    categoryID: number;
    name: string;
  }
  
