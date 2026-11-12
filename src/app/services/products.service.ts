import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { environment } from '../../environment/environment';
import { toApiResponse } from '../functions/http-functions';
import { SearchProducts } from '../interfaces/products.interface';

@Service()
export class ProductsService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = `${environment.url}/products`;

	getProducts() {
		return this.http.get<SearchProducts>(this.baseUrl).pipe(toApiResponse());
	}
}
