import { Component, OnInit } from '@angular/core';
import { Product } from '@models/product';
import { ProductService } from '@services/product.service';
import { Router } from '@angular/router';
import { CategoryService } from '@services/category.service';
import { Category } from '@models/category';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  product: Product = {
    productID: 0,
    name: '',
    description: '',
    sku: '',
    categoryID: 0,
    stockQuantity: 0,
    price: 0,
    currency: 'INR',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  categories: Category[] = [];  
  errorMessage: string = "";
  skuError: string = ""; 
  priceError: string = ""; 

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,  
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.errorMessage = 'Error fetching categories.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';  
    this.skuError = ''; 
    this.priceError = ''; 

    if (this.product.price <= 0) {
      this.priceError = 'Price must be greater than zero.';
      return;
    }

    this.productService.addProduct(this.product).subscribe({
      next: (response) => {
        alert('Product added successfully!');
        this.router.navigate(['/product']);
      },
      error: (err) => {
        console.error("Error response:", err);
        if (err.message.includes('SKU already exists')) {
          this.skuError = 'SKU already exists.';
        } else {
          this.errorMessage = err.message;
        }
        
      }
    });
  }

}
