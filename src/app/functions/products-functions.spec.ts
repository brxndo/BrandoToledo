import { Product } from '../interfaces/products.interface';
import { filterProducts } from './products-functions';

const PRODUCTS: Product[] = [
	{ id: 'trj-crd', name: 'Tarjetas de Crédito', description: 'Tarjeta de consumo bajo la modalidad de crédito', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
	{ id: 'cta-aho', name: 'Cuenta de Ahorros', description: 'Cuenta para guardar tu dinero y ganar intereses', logo: '', date_release: '2025-03-10', date_revision: '2026-03-10' },
	{ id: 'prs-hip', name: 'Préstamo Hipotecario', description: 'Financiamiento para la compra de vivienda', logo: '', date_release: '2025-06-15', date_revision: '2026-06-15' },
];

describe('products-functions', () => {
	describe('filterProducts', () => {
		// con la caja de busqueda vacia se ve todo
		it('deberia devolver todos los productos si no se escribe nada', () => {
			expect(filterProducts(PRODUCTS, '')).toEqual(PRODUCTS);
			expect(filterProducts(PRODUCTS, '   ')).toEqual(PRODUCTS);
		});

		it('deberia buscar por el nombre del producto', () => {
			const result = filterProducts(PRODUCTS, 'ahorros');

			expect(result.length).toBe(1);
			expect(result[0].id).toBe('cta-aho');
		});

		it('deberia buscar tambien en la descripcion', () => {
			const result = filterProducts(PRODUCTS, 'vivienda');

			expect(result.length).toBe(1);
			expect(result[0].id).toBe('prs-hip');
		});

		// la gente casi nunca escribe las tildes ni respeta las mayusculas al buscar
		it('no deberia importar las mayusculas ni las tildes', () => {
			expect(filterProducts(PRODUCTS, 'CREDITO').map((product) => product.id)).toEqual(['trj-crd']);
			expect(filterProducts(PRODUCTS, 'prestamo').map((product) => product.id)).toEqual(['prs-hip']);
		});

		it('deberia devolver una lista vacia si nada coincide', () => {
			expect(filterProducts(PRODUCTS, 'seguro de vida')).toEqual([]);
		});
	});
});
