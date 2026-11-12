import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

@Component({
	imports: [AlertComponent],
	template: `
		<app-alert message="Sin conexión con el servidor">
			<button type="button">Reintentar</button>
		</app-alert>
	`,
})
class HostComponent {}

describe('AlertComponent', () => {
	// el mensaje que le pasen es el que tiene que leer el usuario
	it('deberia mostrar el mensaje de error', async () => {
		const fixture = TestBed.createComponent(HostComponent);
		await fixture.whenStable();
		const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');

		expect(alert?.textContent).toContain('Sin conexión con el servidor');
	});

	// lo que se ponga adentro (por ejemplo un boton de reintentar) sale al lado del mensaje
	it('deberia mostrar el contenido que se le pase adentro', async () => {
		const fixture = TestBed.createComponent(HostComponent);
		await fixture.whenStable();
		const button = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"] button');

		expect(button?.textContent).toContain('Reintentar');
	});
});
