import { Product } from '../interfaces/products.interface';

function normalizeText(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

export function filterProducts(products: Product[], term: string): Product[] {
	const search = normalizeText(term);
	if (search === '') return products;
	return products.filter((product) => normalizeText(product.name).includes(search) || normalizeText(product.description).includes(search));
}
