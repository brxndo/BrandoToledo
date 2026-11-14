import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
	let fixture: ComponentFixture<ConfirmModalComponent>;
	let element: HTMLElement;
	let confirmed: number;
	let cancelled: number;

	beforeEach(async () => {
		fixture = TestBed.createComponent(ConfirmModalComponent);
		element = fixture.nativeElement as HTMLElement;
		document.body.appendChild(element);
		confirmed = 0;
		cancelled = 0;
		fixture.componentInstance.confirmed.subscribe(() => confirmed++);
		fixture.componentInstance.cancelled.subscribe(() => cancelled++);
		fixture.componentRef.setInput('message', '¿Estás seguro de eliminar el producto Tarjetas de Crédito?');
		await fixture.whenStable();
	});

	afterEach(() => {
		element.remove();
	});

	function getButton(text: string): HTMLButtonElement {
		return Array.from(element.querySelectorAll('button')).find((button) => button.textContent?.includes(text)) as HTMLButtonElement;
	}

	it('deberia mostrar la pregunta y los dos botones', () => {
		expect(element.querySelector('[role="dialog"]')?.textContent).toContain('¿Estás seguro de eliminar el producto Tarjetas de Crédito?');
		expect(getButton('Cancelar')).toBeTruthy();
		expect(getButton('Confirmar')).toBeTruthy();
	});

	// el foco arranca en cancelar para que un enter apurado no borre nada por accidente
	it('deberia poner el foco en el boton de cancelar al abrirse', () => {
		expect(document.activeElement).toBe(getButton('Cancelar'));
	});

	it('deberia avisar cuando se confirma', () => {
		getButton('Confirmar').click();

		expect(confirmed).toBe(1);
		expect(cancelled).toBe(0);
	});

	it('deberia avisar cuando se cancela', () => {
		getButton('Cancelar').click();

		expect(cancelled).toBe(1);
		expect(confirmed).toBe(0);
	});

	it('deberia cancelar con la tecla escape', () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

		expect(cancelled).toBe(1);
	});

	// mientras se esta eliminando no se puede cerrar ni volver a confirmar, hay que esperar la respuesta
	it('deberia bloquear los botones mientras esta procesando', async () => {
		fixture.componentRef.setInput('loading', true);
		fixture.componentRef.setInput('loadingText', 'Eliminando...');
		await fixture.whenStable();

		expect(getButton('Eliminando...').disabled).toBe(true);
		expect(getButton('Cancelar').disabled).toBe(true);

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		expect(cancelled).toBe(0);
	});

	it('deberia mostrar el error si la accion falla', async () => {
		fixture.componentRef.setInput('errorMessage', 'Sin conexión con el servidor');
		await fixture.whenStable();

		expect(element.querySelector('[role="alert"]')?.textContent).toContain('Sin conexión con el servidor');
	});

	it('deberia permitir cambiar el texto del boton de confirmar', async () => {
		fixture.componentRef.setInput('confirmText', 'Eliminar');
		await fixture.whenStable();

		expect(getButton('Eliminar')).toBeTruthy();
	});
});
