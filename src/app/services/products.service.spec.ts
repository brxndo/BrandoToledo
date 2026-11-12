import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product, SearchProducts } from '../interfaces/products.interface';
import { ProductsService } from './products.service';

const PRODUCTS: Product[] = [
	{
		id: 'trj-crd',
		name: 'Tarjetas de Crédito',
		description: 'Tarjeta de consumo bajo la modalidad de crédito',
		logo: 'https://www.assets.com/1.png',
		date_release: '2025-01-01',
		date_revision: '2026-01-01',
	},
	{
		id: 'cta-aho',
		name: 'Cuenta de Ahorros',
		description: 'Cuenta para guardar tu dinero y ganar intereses',
		logo: 'https://www.assets.com/2.png',
		date_release: '2025-03-10',
		date_revision: '2026-03-10',
	},
];

describe('ProductsService', () => {
	let service: ProductsService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(ProductsService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	// trae todos los productos que tiene el banco, el back los manda dentro de data
	it('deberia traer los productos', () => {
		let resp: SearchProducts | undefined;
		service.getProducts().subscribe((r) => (resp = r));

		const req = httpMock.expectOne('/bp/products');
		expect(req.request.method).toBe('GET');
		req.flush({ data: PRODUCTS });

		expect(resp?.ok).toBe(true);
		expect(resp?.data.length).toBe(2);
		expect(resp?.data[0].id).toBe('trj-crd');
	});

	// si el servidor se cae el servicio no lanza el error, lo devuelve como ok false con su mensaje
	it('deberia devolver ok false si el servidor falla', () => {
		let resp: SearchProducts | undefined;
		service.getProducts().subscribe((r) => (resp = r));

		httpMock.expectOne('/bp/products').flush('error', { status: 500, statusText: 'Server Error' });

		expect(resp?.ok).toBe(false);
		expect(resp?.message).toBe('Ocurrió un error en el servidor');
	});
});
