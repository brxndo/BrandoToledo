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

	createProduct(product: Product) {
		return this.http.post<ProductResponse>(this.baseUrl, product).pipe(toApiResponse());
	}

	verifyProductId(id: string) {
		return this.http.get<boolean>(`${this.baseUrl}/verification/${encodeURIComponent(id)}`).pipe(
			map((exists): ProductVerification => ({ ok: true, exists })),
			toApiResponse()
		);
	}
}
