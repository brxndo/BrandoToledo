import { TestBed } from '@angular/core/testing';
import { InfoIconComponent } from './info-icon.component';

describe('InfoIconComponent', () => {
	// el texto de ayuda sale al pasar el mouse por encima del icono
	it('deberia poner el texto de ayuda en el icono', async () => {
		const fixture = TestBed.createComponent(InfoIconComponent);
		fixture.componentRef.setInput('text', 'Descripción del producto');
		await fixture.whenStable();

		const icon = (fixture.nativeElement as HTMLElement).querySelector('span');
		expect(icon?.getAttribute('title')).toBe('Descripción del producto');
		expect(icon?.getAttribute('aria-label')).toBe('Descripción del producto');
	});
});
