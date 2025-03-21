import { Component } from '@angular/core';
import { FormsModule } from '../../../node_modules/@angular/forms/index';
import { Product } from '../../models/prduct';
import { ProductService } from '../product.service';
import { Router } from '../../../node_modules/@angular/router/index';
import { CommonModule } from '../../../node_modules/@angular/common/index';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {

  product: Product = {
    ProductID: 0,
    Name: '',
    Description: '',
    SKU: 0,
    CategoryID: 0,
    StockQuantity: 0,
    Price: 0,
    Currency: ''
  }

  errorMessage: string= "";

  constructor(private productService: ProductService, private router: Router){
        // Watch SKU value changes
    this.product.SKU = '';

  }

  // Function to check SKU uniqueness
  checkSku(sku: string) {
    if (sku.length > 0) {
      this.productService.checkSkuUnique(sku).subscribe(
        () => {
          this.skuExists = false;  // SKU is unique
        },
        (error) => {
          if (error.status === 409) {
            this.skuExists = true;  // SKU already exists
          }
        }
      );
    }
  }

  onSubmit() : void {

        // Prevent form submission if SKU is not unique
    if (this.skuExists) {
      this.errorMessage = 'The SKU already exists. Please choose a different one.';
      return;
    }

    //logic to add a product
    this.productService.addProduct(this.product)
        .subscribe({
          next: (response) => {
            this.router.navigate(['/']);


          },
          error: (err) => {
            console.error(err);
            this.errorMessage = `Error occured (${err.message})`;

          }
        });
  }

}




















import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../category.service';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
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
    currency: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  categories: Category[] = [];  
  errorMessage: string = "";

  readonly currency = 'INR';

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

   
    if (this.product.price <= 0) {
      this.errorMessage = 'Price must be greater than zero.';
      return;
    }

   
    this.productService.addProduct(this.product).subscribe({
      next: (response) => {
        alert('Product added successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = `Error occurred (${err.message})`;
      }
    });
  }
}









