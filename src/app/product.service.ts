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
}
