import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [LayoutComponent],
			providers: [provideRouter([])],
		}).compileComponents();
	});

	// la cabecera con el nombre del banco tiene que verse en todas las pantallas
	it('deberia mostrar la cabecera con el nombre del banco', async () => {
		const fixture = TestBed.createComponent(LayoutComponent);
		await fixture.whenStable();
		const header = (fixture.nativeElement as HTMLElement).querySelector('header');
		expect(header?.textContent).toContain('BANCO');
	});

	// aqui adentro es donde se cargan las paginas hijas
	it('deberia tener un outlet para las paginas', async () => {
		const fixture = TestBed.createComponent(LayoutComponent);
		await fixture.whenStable();
		const main = (fixture.nativeElement as HTMLElement).querySelector('main');
		expect(main?.querySelector('router-outlet')).not.toBeNull();
	});
});
