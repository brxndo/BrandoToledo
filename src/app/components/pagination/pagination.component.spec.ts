import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
	let fixture: ComponentFixture<PaginationComponent>;
	let element: HTMLElement;
	let emitted: number[];

	beforeEach(() => {
		fixture = TestBed.createComponent(PaginationComponent);
		element = fixture.nativeElement as HTMLElement;
		emitted = [];
		fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));
	});

	async function render(totalItems: number, itemsPerPage: number, currentPage: number): Promise<void> {
		fixture.componentRef.setInput('totalItems', totalItems);
		fixture.componentRef.setInput('itemsPerPage', itemsPerPage);
		fixture.componentRef.setInput('currentPage', currentPage);
		await fixture.whenStable();
	}

	function getButton(label: string): HTMLButtonElement {
		return element.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
	}

	// si todo entra en una sola pagina no tiene sentido mostrar los botones
	it('no deberia mostrarse si solo hay una pagina', async () => {
		await render(4, 5, 1);

		expect(element.querySelector('nav')).toBeNull();
	});

	it('deberia mostrar en que pagina esta y cuantas hay', async () => {
		await render(12, 5, 2);

		expect(element.querySelector('nav')?.textContent).toContain('2 de 3');
	});

	it('deberia avisar la pagina siguiente y la anterior al dar click', async () => {
		await render(12, 5, 2);

		getButton('Página siguiente').click();
		getButton('Página anterior').click();

		expect(emitted).toEqual([3, 1]);
	});

	// en la primera pagina no se puede ir mas atras y en la ultima no se puede avanzar
	it('deberia bloquear el boton anterior en la primera pagina y el siguiente en la ultima', async () => {
		await render(12, 5, 1);
		expect(getButton('Página anterior').disabled).toBe(true);
		expect(getButton('Página siguiente').disabled).toBe(false);

		await render(12, 5, 3);
		expect(getButton('Página anterior').disabled).toBe(false);
		expect(getButton('Página siguiente').disabled).toBe(true);
	});

	it('no deberia avisar nada si le piden una pagina que no existe', async () => {
		await render(12, 5, 3);

		fixture.componentInstance.changePage(4);
		fixture.componentInstance.changePage(0);

		expect(emitted).toEqual([]);
	});
});
