import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownMenuComponent } from './dropdown-menu.component';

@Component({
	imports: [DropdownMenuComponent],
	template: `
		<app-dropdown-menu label="Opciones de Tarjetas de Crédito">
			<button type="button" role="menuitem" (click)="clicked = 'editar'">Editar</button>
			<button type="button" role="menuitem" (click)="clicked = 'eliminar'">Eliminar</button>
		</app-dropdown-menu>
		<p id="afuera">Texto de afuera</p>
	`,
})
class HostComponent {
	clicked = '';
}

describe('DropdownMenuComponent', () => {
	let fixture: ComponentFixture<HostComponent>;
	let element: HTMLElement;

	beforeEach(async () => {
		fixture = TestBed.createComponent(HostComponent);
		element = fixture.nativeElement as HTMLElement;
		document.body.appendChild(element);
		await fixture.whenStable();
	});

	afterEach(() => {
		element.remove();
	});

	function getTrigger(): HTMLButtonElement {
		return element.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement;
	}

	function getMenu(): HTMLElement | null {
		return element.querySelector('[role="menu"]');
	}

	async function openMenu(): Promise<void> {
		getTrigger().click();
		await fixture.whenStable();
	}

	it('deberia empezar cerrado', () => {
		expect(getMenu()).toBeNull();
		expect(getTrigger().getAttribute('aria-expanded')).toBe('false');
		expect(getTrigger().getAttribute('aria-label')).toBe('Opciones de Tarjetas de Crédito');
	});

	it('deberia mostrar las opciones al dar click en los tres puntos', async () => {
		await openMenu();

		const items = getMenu()?.querySelectorAll('[role="menuitem"]');
		expect(items?.length).toBe(2);
		expect(getTrigger().getAttribute('aria-expanded')).toBe('true');
	});

	it('deberia cerrarse si se vuelve a dar click en los tres puntos', async () => {
		await openMenu();
		await openMenu();

		expect(getMenu()).toBeNull();
	});

	// al escoger una opcion se ejecuta lo que tenga y el menu se quita solo
	it('deberia ejecutar la opcion escogida y cerrarse', async () => {
		await openMenu();

		getMenu()?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.click();
		await fixture.whenStable();

		expect(fixture.componentInstance.clicked).toBe('editar');
		expect(getMenu()).toBeNull();
	});

	it('deberia cerrarse al dar click en cualquier otro lado', async () => {
		await openMenu();

		element.querySelector<HTMLElement>('#afuera')?.click();
		await fixture.whenStable();

		expect(getMenu()).toBeNull();
	});

	it('deberia cerrarse con la tecla escape', async () => {
		await openMenu();

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await fixture.whenStable();

		expect(getMenu()).toBeNull();
	});

	// el menu queda flotando en una posicion fija, si la pagina se mueve quedaria en el aire asi que mejor se cierra
	it('deberia cerrarse si se hace scroll o cambia el tamaño de la ventana', async () => {
		await openMenu();
		window.dispatchEvent(new Event('scroll'));
		await fixture.whenStable();
		expect(getMenu()).toBeNull();

		await openMenu();
		window.dispatchEvent(new Event('resize'));
		await fixture.whenStable();
		expect(getMenu()).toBeNull();
	});

	// si el boton esta muy abajo en la pantalla el menu se abre hacia arriba para que no quede cortado
	it('deberia abrirse hacia arriba cuando no hay espacio abajo', async () => {
		jest.spyOn(getTrigger(), 'getBoundingClientRect').mockReturnValue({ top: window.innerHeight - 40, bottom: window.innerHeight - 8, right: 300 } as DOMRect);

		await openMenu();

		expect(getMenu()?.style.bottom).toBe('44px');
		expect(getMenu()?.style.top).toBe('');
	});

	it('deberia abrirse hacia abajo cuando si hay espacio', async () => {
		jest.spyOn(getTrigger(), 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 132, right: 300 } as DOMRect);

		await openMenu();

		expect(getMenu()?.style.top).toBe('136px');
		expect(getMenu()?.style.bottom).toBe('');
	});
});
