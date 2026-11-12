import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AlertComponent } from '../../components/alert/alert.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { InfoIconComponent } from '../../components/info-icon/info-icon.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { paginate } from '../../functions/general-functions';
import { filterProducts } from '../../functions/products-functions';
import { Product } from '../../interfaces/products.interface';
import { ProductsService } from '../../services/products.service';

@Component({
	selector: 'app-products',
	imports: [DatePipe, AlertComponent, AvatarComponent, InfoIconComponent, PaginationComponent, SearchBoxComponent],
	templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
	private readonly productsService = inject(ProductsService);

	readonly products = signal<Product[]>([]);
	readonly loading = signal(true);
	readonly errorMessage = signal('');
	readonly searchTerm = signal('');
	readonly currentPage = signal(1);
	readonly pagesQuantity = signal(5);
	readonly filteredProducts = computed(() => filterProducts(this.products(), this.searchTerm()));
	readonly pagedProducts = computed(() => paginate(this.filteredProducts(), this.currentPage(), this.pagesQuantity()));
	readonly resultsLabel = computed(() => {
		const shown = this.pagedProducts().length;
		const total = this.filteredProducts().length;
		if (shown === total) return shown === 1 ? '1 Resultado' : `${shown} Resultados`;
		return `${shown} de ${total} Resultados`;
	});
	readonly pageSizes = [5, 10, 20];
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
		this.changePage(1);
	}

	changePage(newPage: number): void {
		this.currentPage.set(newPage);
	}

	changePagesQuantity(quantity: number): void {
		this.pagesQuantity.set(quantity);
		this.changePage(1);
	}
}
