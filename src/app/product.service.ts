import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from '../../node_modules/rxjs/dist/types/index';
import { Product } from '../models/prduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/product`  // check from controller that it is name of class is

  constructor(private http: HttpClient) { }

  getProduct(): Observable<Product[]>{
    return this.http.get<Product[]>(this.apiUrl)
  }

  addProduct(product: Product): Observable<Product>{
    return this.http.post<Product>(this.apiUrl, product);
  }

   // New method to check SKU uniqueness
  checkSkuUnique(sku: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-sku`, sku);
}










import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`; 
 

  constructor(private http: HttpClient) { }

  getProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  
  addProduct(product: Product): Observable<Product>{
    return this.http.post<Product>(this.apiUrl, product);
  }

}











categoryservice.ts:
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = `${environment.apiUrl}/categories`;  // Adjust based on your API URL

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}
