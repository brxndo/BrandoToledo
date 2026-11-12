import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product } from '../../interfaces/products.interface';
import { ProductsComponent } from './products.component';

const PRODUCTS: Product[] = [
	{ id: 'trj-crd', name: 'Tarjetas de Crédito', description: 'Tarjeta de consumo bajo la modalidad de crédito', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
	{ id: 'cta-aho', name: 'Cuenta de Ahorros', description: 'Cuenta para guardar tu dinero y ganar intereses', logo: '', date_release: '2025-03-10', date_revision: '2026-03-10' },
];

describe('ProductsComponent', () => {
	let fixture: ComponentFixture<ProductsComponent>;
	let element: HTMLElement;
	let httpMock: HttpTestingController;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProductsComponent],
			providers: [provideHttpClient(), provideHttpClientTesting()],
		}).compileComponents();

		fixture = TestBed.createComponent(ProductsComponent);
		element = fixture.nativeElement as HTMLElement;
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	function getRows(): HTMLTableRowElement[] {
		return Array.from(element.querySelectorAll('tbody tr'));
	}

	// mientras el back no responde se ven las filas grises de carga y no una tabla vacia
	it('deberia mostrar el skeleton mientras se cargan los productos', async () => {
		fixture.detectChanges();

		expect(element.querySelectorAll('tbody .animate-pulse').length).toBeGreaterThan(0);
		expect(getRows().length).toBe(5);

		httpMock.expectOne('/bp/products').flush({ data: [] });
		await fixture.whenStable();
		expect(element.querySelectorAll('tbody .animate-pulse').length).toBe(0);
	});

	// el caso normal, llegan los productos y sale una fila por cada uno
	it('deberia listar los productos que devuelve el servicio', async () => {
		fixture.detectChanges();
		httpMock.expectOne('/bp/products').flush({ data: PRODUCTS });
		await fixture.whenStable();

		const rows = getRows();
		expect(rows.length).toBe(2);
		expect(rows[0].textContent).toContain('Tarjetas de Crédito');
		expect(rows[0].textContent).toContain('Tarjeta de consumo bajo la modalidad de crédito');
		expect(rows[1].textContent).toContain('Cuenta de Ahorros');
	});

	// las fechas vienen como 2025-01-01 pero en pantalla se tienen que ver dia/mes/año
	it('deberia mostrar las fechas en formato dd/MM/yyyy', async () => {
		fixture.detectChanges();
		httpMock.expectOne('/bp/products').flush({ data: PRODUCTS });
		await fixture.whenStable();

		const cells = getRows()[1].querySelectorAll('td');
		expect(cells[3].textContent?.trim()).toBe('10/03/2025');
		expect(cells[4].textContent?.trim()).toBe('10/03/2026');
	});

	it('deberia avisar cuando no hay ningun producto', async () => {
		fixture.detectChanges();
		httpMock.expectOne('/bp/products').flush({ data: [] });
		await fixture.whenStable();

		expect(getRows().length).toBe(1);
		expect(element.textContent).toContain('Todavía no hay productos registrados');
	});

	// si el back esta caido el usuario tiene que ver un mensaje, no quedarse con la pantalla en blanco
	it('deberia mostrar un mensaje de error si falla la carga', async () => {
		fixture.detectChanges();
		httpMock.expectOne('/bp/products').flush('', { status: 502, statusText: 'Bad Gateway' });
		await fixture.whenStable();

		expect(element.querySelector('[role="alert"]')?.textContent).toContain('Sin conexión con el servidor');
		expect(element.querySelector('table')).toBeNull();
	});

	// el boton de reintentar vuelve a pedir los productos sin tener que recargar la pagina
	it('deberia volver a cargar los productos al dar click en reintentar', async () => {
		fixture.detectChanges();
		httpMock.expectOne('/bp/products').flush('', { status: 500, statusText: 'Server Error' });
		await fixture.whenStable();

		element.querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
		fixture.detectChanges();
		httpMock.expectOne('/bp/products').flush({ data: PRODUCTS });
		await fixture.whenStable();

		expect(element.querySelector('[role="alert"]')).toBeNull();
		expect(getRows().length).toBe(2);
	});
});
