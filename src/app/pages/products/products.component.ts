import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AlertComponent } from '../../components/alert/alert.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { InfoIconComponent } from '../../components/info-icon/info-icon.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { filterProducts } from '../../functions/products-functions';
import { Product } from '../../interfaces/products.interface';
import { ProductsService } from '../../services/products.service';

@Component({
	selector: 'app-products',
	imports: [DatePipe, AlertComponent, AvatarComponent, InfoIconComponent, SearchBoxComponent],
	templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
	private readonly productsService = inject(ProductsService);

	readonly products = signal<Product[]>([]);
	readonly loading = signal(true);
	readonly errorMessage = signal('');
	readonly searchTerm = signal('');
	readonly filteredProducts = computed(() => filterProducts(this.products(), this.searchTerm()));
	readonly skeletonRows = [1, 2, 3, 4, 5];

	ngOnInit(): void {
		this.loadProducts();
	}

	loadProducts(): void {
		this.loading.set(true);
		this.errorMessage.set('');
		this.productsService.getProducts().subscribe((resp) => {
			if (resp.ok) {
				this.products.set(resp.data ?? []);
			} else {
				this.errorMessage.set(resp.message ?? 'No se pudieron cargar los productos');
			}
			this.loading.set(false);
		});
	}

	changeTerm(term: string): void {
		this.searchTerm.set(term);
	}
}
