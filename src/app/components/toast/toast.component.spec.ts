import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
	let fixture: ComponentFixture<ToastComponent>;
	let element: HTMLElement;
	let toastService: ToastService;

	beforeEach(() => {
		fixture = TestBed.createComponent(ToastComponent);
		element = fixture.nativeElement as HTMLElement;
		toastService = TestBed.inject(ToastService);
	});

	afterEach(() => {
		toastService.close();
	});

	it('no deberia mostrar nada si no hay ningun aviso', async () => {
		await fixture.whenStable();

		expect(element.querySelector('[role="status"]')).toBeNull();
	});

	// los avisos de exito salen en verde
	it('deberia mostrar el aviso de exito', async () => {
		toastService.showSuccess('Producto agregado correctamente');
		await fixture.whenStable();

		const toast = element.querySelector('[role="status"]');
		expect(toast?.textContent).toContain('Producto agregado correctamente');
		expect(toast?.classList).toContain('bg-green-600');
	});

	it('deberia mostrar el aviso de error en rojo', async () => {
		toastService.showError('No se pudo eliminar el producto');
		await fixture.whenStable();

		expect(element.querySelector('[role="status"]')?.classList).toContain('bg-red-600');
	});

	it('deberia cerrarse al dar click en la x', async () => {
		toastService.showSuccess('Producto agregado correctamente');
		await fixture.whenStable();

		element.querySelector('button')?.click();
		await fixture.whenStable();

		expect(element.querySelector('[role="status"]')).toBeNull();
	});
});
