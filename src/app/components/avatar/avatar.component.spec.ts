import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
	let fixture: ComponentFixture<AvatarComponent>;
	let element: HTMLElement;

	beforeEach(() => {
		fixture = TestBed.createComponent(AvatarComponent);
		element = fixture.nativeElement as HTMLElement;
	});

	// si el producto tiene logo se muestra la imagen
	it('deberia mostrar la imagen cuando hay una url', async () => {
		fixture.componentRef.setInput('src', 'https://www.assets.com/1.png');
		fixture.componentRef.setInput('name', 'Tarjetas de Crédito');
		await fixture.whenStable();

		const img = element.querySelector('img');
		expect(img?.getAttribute('src')).toBe('https://www.assets.com/1.png');
		expect(img?.getAttribute('alt')).toBe('Logo de Tarjetas de Crédito');
	});

	// muchas veces la url del logo no existe, en ese caso se ponen las iniciales como en el diseño
	it('deberia mostrar las iniciales si la imagen no carga', async () => {
		fixture.componentRef.setInput('src', 'www.assets.com/no-existe.png');
		fixture.componentRef.setInput('name', 'Tarjetas de Crédito');
		await fixture.whenStable();

		element.querySelector('img')?.dispatchEvent(new Event('error'));
		await fixture.whenStable();

		expect(element.querySelector('img')).toBeNull();
		expect(element.textContent?.trim()).toBe('TC');
	});

	it('deberia mostrar las iniciales si no viene ninguna url', async () => {
		fixture.componentRef.setInput('name', 'Cuenta de Ahorros');
		await fixture.whenStable();

		expect(element.querySelector('img')).toBeNull();
		expect(element.textContent?.trim()).toBe('CA');
	});

	// si despues le cambian el logo (por ejemplo al editar) tiene que volver a intentar con la imagen nueva
	it('deberia volver a intentar cargar la imagen si cambia la url', async () => {
		fixture.componentRef.setInput('src', 'www.assets.com/no-existe.png');
		fixture.componentRef.setInput('name', 'Cuenta de Ahorros');
		await fixture.whenStable();
		element.querySelector('img')?.dispatchEvent(new Event('error'));
		await fixture.whenStable();

		fixture.componentRef.setInput('src', 'https://www.assets.com/nuevo.png');
		await fixture.whenStable();

		expect(element.querySelector('img')?.getAttribute('src')).toBe('https://www.assets.com/nuevo.png');
	});
});
