import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const PAGES_ROUTES: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [],
	},
];
