import { Routes } from '@angular/router';
import { ProductTableComponent } from './product-table/product-table.component';
import { ProductFormComponent } from './product-form/product-form.component';

export const routes: Routes = [
    {path: '', component: ProductTableComponent},
    {path: 'add', component: ProductFormComponent}
    {path: 'product', redirectTo: '', pathMatch: 'full'}
];


import { Routes } from '@angular/router';
import { ProductTableComponent } from './product-table/product-table.component';
import { ProductFormComponent } from './product-form/product-form.component';

export const routes: Routes = [
    {path: '', component: ProductTableComponent},         //maps to ProductTableComponent display list of products
    {path: 'add', component: ProductFormComponent},       //maps to ProductFormComponent to display the form 
    {path: 'product', redirectTo: '', pathMatch: 'full'}  //redirects to home page
];
