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
