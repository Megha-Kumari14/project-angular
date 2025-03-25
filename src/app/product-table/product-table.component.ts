import { Component, OnInit } from '@angular/core';
import { Product } from '@models/product';
import { ProductService } from '@services/product.service';
import { CategoryService } from '@services/category.service';  
import { Category } from '@models/category';
import { Router } from '@angular/router';  

@Component({
  selector: 'product-table',
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.scss']
})
export class ProductTableComponent implements OnInit {

  products: Product[] = [];
  categories: Category[] = []; 

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router  

  ) {}

  ngOnInit() {
    this.productService.getProduct().subscribe({
      next: (data: Product[]) => {
        console.log('Fetched products:', data);  
        this.products = data;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });

    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        console.log('Fetched categories:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  getCategoryName(categoryID: number): string {
    const category = this.categories.find(cat => cat.categoryID === categoryID);
    return category ? category.name : 'Unknown'; 
  }

  onAddProduct(): void {
    this.router.navigate(['/product/add']);
    
  }
}
