import { ApiResponse } from '../functions/http-functions';

export interface Product {
	id: string;
	name: string;
	description: string;
	logo: string;
	date_release: Date | string;
	date_revision: Date | string;
}

export interface SearchProducts extends ApiResponse {
	data: Product[];
}
