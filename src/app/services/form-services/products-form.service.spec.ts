import { of } from 'rxjs';
import { Product, ProductVerification } from '../../interfaces/products.interface';
import { ProductForm, ProductsFormService } from './products-form.service';

describe('ProductsFormService', () => {
	const service = new ProductsFormService();
	let verification: ProductVerification;
	let form: ProductForm;

	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date(2026, 10, 12, 10, 0));
		verification = { ok: true, exists: false };
		form = service.createEmptyProductForm(() => of(verification));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	function fillValidForm(): void {
		form.setValue({
			id: 'trj-crd',
			name: 'Tarjetas de Crédito',
			description: 'Tarjeta de consumo bajo la modalidad de crédito',
			logo: 'https://www.assets.com/1.png',
			date_release: '2026-11-12',
			date_revision: '2027-11-12',
		});
		jest.advanceTimersByTime(400);
	}

	describe('createEmptyProductForm', () => {
		it('deberia crear el formulario vacio y sin poder enviarse', () => {
			expect(form.getRawValue()).toEqual({ id: '', name: '', description: '', logo: '', date_release: '', date_revision: '' });
			expect(form.valid).toBe(false);
		});

		it('deberia ser valido cuando todos los campos cumplen las reglas', () => {
			fillValidForm();

			expect(form.valid).toBe(true);
		});

		// el id va de 3 a 10 caracteres
		it('deberia validar el largo del id', () => {
			fillValidForm();

			form.controls.id.setValue('ab');
			expect(form.controls.id.hasError('minlength')).toBe(true);

			form.controls.id.setValue('12345678901');
			expect(form.controls.id.hasError('maxlength')).toBe(true);
		});

		// mientras se consulta al back el formulario queda en espera, y si el id ya existe queda invalido
		it('deberia dejar invalido el id si ya existe', () => {
			verification = { ok: true, exists: true };
			fillValidForm();

			expect(form.controls.id.hasError('idExists')).toBe(true);
			expect(form.valid).toBe(false);
		});

		it('deberia validar el largo del nombre y de la descripcion', () => {
			fillValidForm();

			form.controls.name.setValue('abcd');
			form.controls.description.setValue('muy corta');
			expect(form.controls.name.hasError('minlength')).toBe(true);
			expect(form.controls.description.hasError('minlength')).toBe(true);

			form.controls.name.setValue('a'.repeat(101));
			form.controls.description.setValue('a'.repeat(201));
			expect(form.controls.name.hasError('maxlength')).toBe(true);
			expect(form.controls.description.hasError('maxlength')).toBe(true);
		});

		it('deberia rechazar una fecha de liberacion anterior a hoy', () => {
			fillValidForm();

			form.controls.date_release.setValue('2026-11-11');

			expect(form.controls.date_release.hasError('beforeToday')).toBe(true);
		});

		it('deberia rechazar una fecha de revision que no sea un año despues', () => {
			fillValidForm();

			form.controls.date_revision.setValue('2027-11-13');

			expect(form.hasError('oneYearAfter')).toBe(true);
			expect(form.valid).toBe(false);
		});
	});

	describe('loadProductInForm', () => {
		const product: Product = {
			id: 'trj-crd',
			name: 'Tarjetas de Crédito',
			description: 'Tarjeta de consumo bajo la modalidad de crédito',
			logo: 'https://www.assets.com/1.png',
			date_release: '2026-12-01T00:00:00.000Z',
			date_revision: '2027-12-01T00:00:00.000Z',
		};

		// las fechas pueden venir con hora desde el back, en el formulario se dejan solo como fecha
		it('deberia cargar los datos del producto en el formulario', () => {
			service.loadProductInForm(form, product);

			expect(form.getRawValue()).toEqual({ ...product, date_release: '2026-12-01', date_revision: '2027-12-01' });
			expect(form.valid).toBe(true);
		});

		// al editar el id queda bloqueado, y como ese id ya existe (es el del mismo producto) no se debe consultar al back
		it('deberia bloquear el id sin volver a verificarlo', () => {
			const verifyId = jest.fn(() => of({ ok: true, exists: true }));
			const editForm = service.createEmptyProductForm(verifyId);

			service.loadProductInForm(editForm, product);
			jest.advanceTimersByTime(400);

			expect(editForm.controls.id.disabled).toBe(true);
			expect(verifyId).not.toHaveBeenCalled();
			expect(service.getProductFieldError(editForm, 'id')).toBe('');
		});

		// asi los errores que ya traiga el producto (como una fecha vencida) se ven sin tener que tocar el campo
		it('deberia dejar los campos como tocados para que se vean los errores', () => {
			service.loadProductInForm(form, { ...product, date_release: '2025-01-01' });

			expect(service.getProductFieldError(form, 'date_release')).toBe('La fecha debe ser igual o mayor a la fecha actual');
		});
	});

	describe('buildChangesToSend', () => {
		// en el PUT el id va en la url, por eso se saca del cuerpo
		it('deberia armar los cambios sin el id', () => {
			fillValidForm();

			expect(service.buildChangesToSend(form)).toEqual({
				name: 'Tarjetas de Crédito',
				description: 'Tarjeta de consumo bajo la modalidad de crédito',
				logo: 'https://www.assets.com/1.png',
				date_release: '2026-11-12',
				date_revision: '2027-11-12',
			});
		});
	});

	describe('buildProductToSend', () => {
		it('deberia armar el producto tal como lo espera el back', () => {
			fillValidForm();

			expect(service.buildProductToSend(form)).toEqual({
				id: 'trj-crd',
				name: 'Tarjetas de Crédito',
				description: 'Tarjeta de consumo bajo la modalidad de crédito',
				logo: 'https://www.assets.com/1.png',
				date_release: '2026-11-12',
				date_revision: '2027-11-12',
			});
		});
	});

	describe('getProductFieldError', () => {
		// no se le reclama nada al usuario por un campo que todavia ni ha tocado
		it('no deberia devolver errores de campos que no se han tocado', () => {
			expect(service.getProductFieldError(form, 'id')).toBe('');
			expect(service.getProductFieldError(form, 'name')).toBe('');
		});

		it('deberia avisar que el campo es requerido', () => {
			form.markAllAsTouched();

			expect(service.getProductFieldError(form, 'id')).toBe('Este campo es requerido!');
			expect(service.getProductFieldError(form, 'logo')).toBe('Este campo es requerido!');
			expect(service.getProductFieldError(form, 'date_release')).toBe('Este campo es requerido!');
			expect(service.getProductFieldError(form, 'date_revision')).toBe('Este campo es requerido!');
		});

		it('deberia devolver el mensaje del id segun el problema', () => {
			form.markAllAsTouched();

			form.controls.id.setValue('ab');
			expect(service.getProductFieldError(form, 'id')).toBe('ID no válido! Debe tener entre 3 y 10 caracteres');

			verification = { ok: true, exists: true };
			form.controls.id.setValue('trj-crd');
			jest.advanceTimersByTime(400);
			expect(service.getProductFieldError(form, 'id')).toBe('ID no válido! Ya existe un producto con ese ID');

			verification = { ok: false, message: 'Sin conexión con el servidor' };
			form.controls.id.setValue('otro-id');
			jest.advanceTimersByTime(400);
			expect(service.getProductFieldError(form, 'id')).toBe('No se pudo verificar el ID, intenta de nuevo');
		});

		it('deberia devolver los mensajes de nombre, descripcion y fechas', () => {
			fillValidForm();
			form.markAllAsTouched();

			form.controls.name.setValue('abcd');
			form.controls.description.setValue('corta');
			form.controls.date_release.setValue('2026-11-01');
			form.controls.date_revision.setValue('2028-01-01');

			expect(service.getProductFieldError(form, 'name')).toBe('El nombre debe tener entre 5 y 100 caracteres');
			expect(service.getProductFieldError(form, 'description')).toBe('La descripción debe tener entre 10 y 200 caracteres');
			expect(service.getProductFieldError(form, 'date_release')).toBe('La fecha debe ser igual o mayor a la fecha actual');
			expect(service.getProductFieldError(form, 'date_revision')).toBe('Debe ser exactamente un año posterior a la fecha de liberación');
		});

		it('no deberia devolver errores cuando todo esta bien', () => {
			fillValidForm();
			form.markAllAsTouched();

			expect(service.getProductFieldError(form, 'id')).toBe('');
			expect(service.getProductFieldError(form, 'name')).toBe('');
			expect(service.getProductFieldError(form, 'description')).toBe('');
			expect(service.getProductFieldError(form, 'logo')).toBe('');
			expect(service.getProductFieldError(form, 'date_release')).toBe('');
			expect(service.getProductFieldError(form, 'date_revision')).toBe('');
		});
	});
});
