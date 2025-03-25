import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Product } from '@models/product';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  //private apiUrl = `${environment.apiBaseUrl}/products`;
  private apiUrl = `http://localhost:5014/api/products`;

  constructor(private http: HttpClient) {}

  getProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to load products.'));
      })
    );
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(error => {
        console.error('Error adding product:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to add product.'));
      })
    );
  }
}











categoryservice.ts:
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Category } from '@models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  //private apiUrl = `${environment.apiBaseUrl}/categories`; 
  private apiUrl = `http://localhost:5014/api/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}
