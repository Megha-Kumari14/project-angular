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







app-routing.module.ts:
// Angular modules
import { NgModule }          from '@angular/core';
import { Routes }            from '@angular/router';
import { RouterModule }      from '@angular/router';

// Components
import { NotFoundComponent } from './static/not-found/not-found.component';
import { ProductFormComponent } from './pages/product/product-form/product-form.component';
import { ProductTableComponent } from './pages/product/product-table/product-table.component';

const routes : Routes = [

  {
    path         : 'auth',
    loadChildren : () => import('./pages/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path         : 'home',
    loadChildren : () => import('./pages/home/home.module').then(m => m.HomeModule),
  },
  { path : '',   redirectTo : '/home', pathMatch : 'full' },
  //{ path : '**', component : NotFoundComponent },
  
  {path: 'product', component: ProductTableComponent},         
  {path: 'product/add', component: ProductFormComponent},       
  {path: 'product', redirectTo: '', pathMatch: 'full'}  

];

@NgModule({
  imports : [RouterModule.forRoot(routes, { relativeLinkResolution : 'legacy', onSameUrlNavigation : 'reload' })],
  exports : [RouterModule]
})
export class AppRoutingModule { }

