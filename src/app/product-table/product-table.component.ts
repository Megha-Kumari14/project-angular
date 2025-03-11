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
