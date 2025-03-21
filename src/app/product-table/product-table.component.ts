import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/prduct';
import { ProductService } from '../product.service';
import { CommonModule } from '../../../node_modules/@angular/common/index';

@Component({
  selector: 'product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.css'
})
export class ProductTableComponent {

  product: Product[] = [];

  constructor(private productService: ProductService){}

  ngOnit(){
    this.productService.getProduct().subscribe((data: Product[]) => {
      this.product = data;
      console.log(data);
    })
  }

}















import { Component, OnInit } from '@angular/core';
import { Product } from '../../../models/product';
import { ProductService } from '../product.service';
import { CategoryService } from '../category.service';  
import { Category } from '../../../models/category';  
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import Router from '@angular/router'


@Component({
  selector: 'product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.css']
})
export class ProductTableComponent implements OnInit {

  products: Product[] = [];
  categories: Category[] = []; // Storing categories

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router   // Inject Router here

  ) {}

  ngOnInit() {
    // Fetch products
    this.productService.getProduct().subscribe({
      next: (data: Product[]) => {
        console.log('Fetched products:', data);  
        this.products = data;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });

    // Fetch categories
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

  // Method to get category name by categoryID
  getCategoryName(categoryID: number): string {
    const category = this.categories.find(cat => cat.categoryID === categoryID);
    return category ? category.name : 'Unknown'; 
  }

  // Navigate to product form when 'Add Product' button is clicked
  onAddProduct(): void {
    this.router.navigate(['/add']);
  }

}

