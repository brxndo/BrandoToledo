import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';

@Component({
	imports: [FormFieldComponent],
	template: `
		<app-form-field label="ID" forId="id" [error]="error()">
			<input id="id" type="text" />
		</app-form-field>
	`,
})
class HostComponent {
	readonly error = signal('');
}

describe('FormFieldComponent', () => {
	let fixture: ComponentFixture<HostComponent>;
	let element: HTMLElement;

	beforeEach(async () => {
		fixture = TestBed.createComponent(HostComponent);
		element = fixture.nativeElement as HTMLElement;
		await fixture.whenStable();
	});

	// la etiqueta queda amarrada al input para que al darle click se enfoque el campo
	it('deberia mostrar la etiqueta unida al input', () => {
		const label = element.querySelector('label');

		expect(label?.textContent).toBe('ID');
		expect(label?.getAttribute('for')).toBe('id');
		expect(element.querySelector('app-form-field input')).not.toBeNull();
	});

	it('no deberia mostrar ningun mensaje si el campo esta bien', () => {
		expect(element.querySelector('small')).toBeNull();
	});

	// el mensaje en rojo va debajo del input como en el diseño
	it('deberia mostrar el mensaje de error debajo del campo', async () => {
		fixture.componentInstance.error.set('ID no válido!');
		await fixture.whenStable();

		expect(element.querySelector('small')?.textContent).toBe('ID no válido!');
	});
});
