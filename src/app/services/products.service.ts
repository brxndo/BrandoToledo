import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environment/environment';
import { toApiResponse } from '../functions/http-functions';
import { Product, ProductResponse, ProductVerification, SearchProducts } from '../interfaces/products.interface';

@Service()
export class ProductsService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = `${environment.url}/products`;

	getProducts() {
		return this.http.get<SearchProducts>(this.baseUrl).pipe(toApiResponse());
	}

	getProductById(id: string) {
		return this.http.get<Product>(this.getProductUrl(id)).pipe(
			map((data): ProductResponse => ({ ok: true, data })),
			toApiResponse()
		);
	}

	createProduct(product: Product) {
		return this.http.post<ProductResponse>(this.baseUrl, product).pipe(toApiResponse());
	}

	updateProduct(id: string, changes: Partial<Product>) {
		return this.http.put<ProductResponse>(this.getProductUrl(id), changes).pipe(toApiResponse());
	}

	deleteProduct(id: string) {
		return this.http.delete<ProductResponse>(this.getProductUrl(id)).pipe(toApiResponse());
	}

	verifyProductId(id: string) {
		return this.http.get<boolean>(`${this.baseUrl}/verification/${encodeURIComponent(id)}`).pipe(
			map((exists): ProductVerification => ({ ok: true, exists })),
			toApiResponse()
		);
	}

	private getProductUrl(id: string): string {
		return `${this.baseUrl}/${encodeURIComponent(id)}`;
	}
}
