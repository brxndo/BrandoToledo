import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product, ProductResponse, ProductVerification, SearchProducts } from '../interfaces/products.interface';
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

	// al crear se manda el producto completo por POST
	it('deberia crear un producto', () => {
		let resp: ProductResponse | undefined;
		service.createProduct(PRODUCTS[0]).subscribe((r) => (resp = r));

		const req = httpMock.expectOne('/bp/products');
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(PRODUCTS[0]);
		req.flush({ message: 'Product added successfully', data: PRODUCTS[0] });

		expect(resp?.ok).toBe(true);
		expect(resp?.data?.id).toBe('trj-crd');
	});

	// el back rechaza los id repetidos con un 400, aqui se revisa que llegue el mensaje ya traducido
	it('deberia avisar si el id ya existe al crear', () => {
		let resp: ProductResponse | undefined;
		service.createProduct(PRODUCTS[0]).subscribe((r) => (resp = r));

		httpMock.expectOne('/bp/products').flush({ name: 'BadRequestError', message: 'Duplicate identifier found in the database' }, { status: 400, statusText: 'Bad Request' });

		expect(resp?.ok).toBe(false);
		expect(resp?.message).toBe('Ya existe un producto con ese ID');
	});

	// el servicio de verificacion solo devuelve true o false, se lo acomoda para saber si existe o no
	it('deberia decir si un id ya existe', () => {
		let exists: boolean | undefined;
		service.verifyProductId('trj-crd').subscribe((r) => (exists = r.exists));
		httpMock.expectOne('/bp/products/verification/trj-crd').flush(true);
		expect(exists).toBe(true);

		service.verifyProductId('nuevo').subscribe((r) => (exists = r.exists));
		httpMock.expectOne('/bp/products/verification/nuevo').flush(false);
		expect(exists).toBe(false);
	});

	it('deberia devolver ok false si no se pudo verificar el id', () => {
		let resp: ProductVerification | undefined;
		service.verifyProductId('trj-crd').subscribe((r) => (resp = r));

		httpMock.expectOne('/bp/products/verification/trj-crd').flush('', { status: 502, statusText: 'Bad Gateway' });

		expect(resp?.ok).toBe(false);
		expect(resp?.exists).toBeUndefined();
	});

	// por si alguien escribe un id con espacios o simbolos raros, que no rompa la url
	it('deberia codificar el id en la url de verificacion', () => {
		service.verifyProductId('a b/c').subscribe();

		httpMock.expectOne('/bp/products/verification/a%20b%2Fc').flush(false);
	});
});
