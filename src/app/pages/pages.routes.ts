import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const PAGES_ROUTES: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{ path: 'products', loadComponent: () => import('./products/products.component').then((m) => m.ProductsComponent) },
			{ path: 'products/new', loadComponent: () => import('./products/products-form/products-form.component').then((m) => m.ProductsFormComponent) },
			{ path: '', redirectTo: 'products', pathMatch: 'full' },
		],
	},
];
