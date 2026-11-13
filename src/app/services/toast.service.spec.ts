import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
	let service: ToastService;

	beforeEach(() => {
		jest.useFakeTimers();
		service = TestBed.inject(ToastService);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('deberia guardar el aviso de exito que se quiere mostrar', () => {
		service.showSuccess('Producto agregado correctamente');

		expect(service.toast()).toEqual({ message: 'Producto agregado correctamente', type: 'success' });
	});

	it('deberia guardar el aviso de error', () => {
		service.showError('No se pudo eliminar el producto');

		expect(service.toast()).toEqual({ message: 'No se pudo eliminar el producto', type: 'error' });
	});

	// el aviso se va solo despues de unos segundos para que no se quede estorbando en la pantalla
	it('deberia quitar el aviso solo despues de 4 segundos', () => {
		service.showSuccess('Producto agregado correctamente');

		jest.advanceTimersByTime(3999);
		expect(service.toast()).not.toBeNull();

		jest.advanceTimersByTime(1);
		expect(service.toast()).toBeNull();
	});

	it('deberia poder cerrarse antes de tiempo', () => {
		service.showSuccess('Producto agregado correctamente');
		service.close();

		expect(service.toast()).toBeNull();
	});

	// si sale un aviso nuevo mientras hay otro, el tiempo se cuenta desde el nuevo
	it('deberia reiniciar el tiempo cuando se muestra otro aviso', () => {
		service.showSuccess('Primer aviso');
		jest.advanceTimersByTime(3000);
		service.showError('Segundo aviso');
		jest.advanceTimersByTime(3000);

		expect(service.toast()?.message).toBe('Segundo aviso');
	});
});
