import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [App],
			providers: [provideRouter([])],
		}).compileComponents();
	});

	// lo minimo, que la app levante sin romperse
	it('deberia crear la app', () => {
		const fixture = TestBed.createComponent(App);
		expect(fixture.componentInstance).toBeTruthy();
	});

	// el root solo tiene el outlet, todo lo demas lo pintan las rutas
	it('deberia tener el router outlet', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('router-outlet')).not.toBeNull();
	});
});
