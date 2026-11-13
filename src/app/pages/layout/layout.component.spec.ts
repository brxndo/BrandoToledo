import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastService } from '../../services/toast.service';
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

	// desde el formulario no hay otro boton para regresar, por eso el logo lleva al listado
	it('deberia tener el logo como enlace al inicio', async () => {
		const fixture = TestBed.createComponent(LayoutComponent);
		await fixture.whenStable();
		const link = (fixture.nativeElement as HTMLElement).querySelector('header a');
		expect(link?.getAttribute('href')).toBe('/');
	});

	// los avisos de exito o error se muestran aqui para que salgan en cualquier pantalla
	it('deberia mostrar los avisos del toast', async () => {
		const fixture = TestBed.createComponent(LayoutComponent);
		TestBed.inject(ToastService).showSuccess('Producto agregado correctamente');
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent).toContain('Producto agregado correctamente');
		TestBed.inject(ToastService).close();
	});

	// aqui adentro es donde se cargan las paginas hijas
	it('deberia tener un outlet para las paginas', async () => {
		const fixture = TestBed.createComponent(LayoutComponent);
		await fixture.whenStable();
		const main = (fixture.nativeElement as HTMLElement).querySelector('main');
		expect(main?.querySelector('router-outlet')).not.toBeNull();
	});
});
