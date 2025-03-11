import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { RouterModule } from '../../node_modules/@angular/router/index';
import { ProductTableComponent } from './product-table/product-table.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductTableComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'product-catalog-app';
}
