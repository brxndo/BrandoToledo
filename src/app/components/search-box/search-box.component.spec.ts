import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBoxComponent } from './search-box.component';

describe('SearchBoxComponent', () => {
	let fixture: ComponentFixture<SearchBoxComponent>;
	let input: HTMLInputElement;
	let emitted: string[];

	beforeEach(() => {
		jest.useFakeTimers();
		fixture = TestBed.createComponent(SearchBoxComponent);
		emitted = [];
		fixture.componentInstance.termChange.subscribe((value) => emitted.push(value));
		fixture.detectChanges();
		input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	function type(value: string): void {
		input.value = value;
		input.dispatchEvent(new Event('input'));
	}

	// no se avisa en cada tecla, se espera un ratito a que la persona termine de escribir
	it('deberia esperar antes de avisar lo que se escribio', () => {
		type('tarjeta');

		jest.advanceTimersByTime(200);
		expect(emitted).toEqual([]);

		jest.advanceTimersByTime(100);
		expect(emitted).toEqual(['tarjeta']);
	});

	// si escribe rapido varias letras solo interesa lo ultimo que quedo en la caja
	it('deberia avisar solo el ultimo texto si se escribe seguido', () => {
		type('t');
		jest.advanceTimersByTime(100);
		type('ta');
		jest.advanceTimersByTime(100);
		type('tar');
		jest.advanceTimersByTime(300);

		expect(emitted).toEqual(['tar']);
	});

	it('deberia mostrar el placeholder y el texto inicial que le pasen', () => {
		fixture.componentRef.setInput('placeholder', 'Search...');
		fixture.componentRef.setInput('term', 'ahorros');
		fixture.detectChanges();

		expect(input.placeholder).toBe('Search...');
		expect(input.value).toBe('ahorros');
	});
});
