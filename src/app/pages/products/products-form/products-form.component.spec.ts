import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Product } from '../../../interfaces/products.interface';
import { ToastService } from '../../../services/toast.service';
import { ProductsFormComponent } from './products-form.component';

describe('ProductsFormComponent', () => {
	let fixture: ComponentFixture<ProductsFormComponent>;
	let element: HTMLElement;
	let httpMock: HttpTestingController;
	let navigate: jest.SpyInstance;

	beforeEach(async () => {
		jest.useFakeTimers().setSystemTime(new Date(2026, 10, 12, 10, 0));

		await TestBed.configureTestingModule({
			imports: [ProductsFormComponent],
			providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
		}).compileComponents();

		fixture = TestBed.createComponent(ProductsFormComponent);
		element = fixture.nativeElement as HTMLElement;
		httpMock = TestBed.inject(HttpTestingController);
		navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
	});

	afterEach(() => {
		httpMock.verify();
		TestBed.inject(ToastService).close();
		jest.useRealTimers();
	});

	function getInput(id: string): HTMLInputElement {
		return element.querySelector(`#${id}`) as HTMLInputElement;
	}

	function write(id: string, value: string): void {
		const input = getInput(id);
		input.value = value;
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
	}

	function getFieldError(id: string): string {
		return getInput(id).closest('app-form-field')?.querySelector('small.text-red-600')?.textContent ?? '';
	}

	function getButton(text: string): HTMLButtonElement {
		return Array.from(element.querySelectorAll('button')).find((button) => button.textContent?.includes(text)) as HTMLButtonElement;
	}

	async function answerVerification(exists: boolean): Promise<void> {
		await jest.advanceTimersByTimeAsync(400);
		httpMock.expectOne((req) => req.url.startsWith('/bp/products/verification/')).flush(exists);
		fixture.detectChanges();
	}

	async function fillValidForm(): Promise<void> {
		write('id', 'trj-crd');
		await answerVerification(false);
		write('name', 'Tarjetas de Crédito');
		write('description', 'Tarjeta de consumo bajo la modalidad de crédito');
		write('logo', 'https://www.assets.com/1.png');
		write('date_release', '2026-11-12');
	}

	function submit(): void {
		getButton('Enviar').click();
		fixture.detectChanges();
	}

	describe('al agregar un producto', () => {
		beforeEach(() => {
			fixture.detectChanges();
		});

		it('deberia mostrar el formulario con sus seis campos y los dos botones', () => {
			expect(element.querySelector('h1')?.textContent).toContain('Formulario de Registro');
			expect(element.querySelectorAll('form input').length).toBe(6);
			expect(getButton('Reiniciar')).toBeTruthy();
			expect(getButton('Enviar')).toBeTruthy();
		});

		// con el formulario vacio no se puede enviar, el boton sale apagado como en el diseño
		it('deberia tener el boton de enviar deshabilitado mientras falten campos', () => {
			expect(getButton('Enviar').disabled).toBe(true);

			write('name', 'Tarjetas de Crédito');
			write('logo', 'https://www.assets.com/1.png');

			expect(getButton('Enviar').disabled).toBe(true);
		});

		it('deberia habilitar el boton cuando todos los campos estan completos y bien', async () => {
			await fillValidForm();

			expect(getButton('Enviar').disabled).toBe(false);
		});

		// si despues de llenar todo se daña un campo, el boton se vuelve a apagar
		it('deberia volver a deshabilitar el boton si un campo deja de ser valido', async () => {
			await fillValidForm();

			write('description', '');

			expect(getButton('Enviar').disabled).toBe(true);
		});

		// si entra a un campo y lo deja vacio, se marca en rojo con su mensaje
		it('deberia mostrar que el campo es requerido cuando se deja vacio', () => {
			for (const id of ['id', 'name', 'description', 'logo', 'date_release']) {
				write(id, '');

				expect(getFieldError(id)).toBe('Este campo es requerido!');
				expect(getInput(id).classList).toContain('border-red-500');
			}
		});

		it('deberia avisar si el id es muy corto o muy largo', () => {
			write('id', 'ab');
			expect(getFieldError('id')).toBe('ID no válido! Debe tener entre 3 y 10 caracteres');

			write('id', '12345678901');
			expect(getFieldError('id')).toBe('ID no válido! Debe tener entre 3 y 10 caracteres');
		});

		// aqui se usa el servicio de verificacion, si responde true es que ese id ya esta ocupado
		it('deberia avisar si el id ya existe', async () => {
			write('id', 'trj-crd');
			await answerVerification(true);

			expect(getFieldError('id')).toBe('ID no válido! Ya existe un producto con ese ID');
		});

		it('no deberia mostrar error si el id esta libre', async () => {
			write('id', 'trj-crd');
			await answerVerification(false);

			expect(getFieldError('id')).toBe('');
			expect(getInput('id').classList).not.toContain('border-red-500');
		});

		// mientras se consulta el id no se puede enviar, para no crear algo que todavia no se sabe si esta repetido
		it('deberia bloquear el boton de enviar mientras se verifica el id', async () => {
			await fillValidForm();
			write('id', 'otro-id');

			expect(getButton('Enviar').disabled).toBe(true);
			expect(element.textContent).toContain('Verificando ID...');

			await answerVerification(false);
			expect(getButton('Enviar').disabled).toBe(false);
			expect(element.textContent).not.toContain('Verificando ID...');
		});

		it('deberia avisar si no se pudo verificar el id', async () => {
			write('id', 'trj-crd');
			await jest.advanceTimersByTimeAsync(400);
			httpMock.expectOne('/bp/products/verification/trj-crd').flush('', { status: 502, statusText: 'Bad Gateway' });
			fixture.detectChanges();

			expect(getFieldError('id')).toBe('No se pudo verificar el ID, intenta de nuevo');
		});

		it('deberia validar el largo del nombre y la descripcion', () => {
			write('name', 'abcd');
			write('description', 'muy corta');

			expect(getFieldError('name')).toBe('El nombre debe tener entre 5 y 100 caracteres');
			expect(getFieldError('description')).toBe('La descripción debe tener entre 10 y 200 caracteres');
		});

		// la fecha de liberacion puede ser hoy pero no un dia que ya paso
		it('deberia rechazar una fecha de liberacion anterior a hoy', () => {
			write('date_release', '2026-11-11');
			expect(getFieldError('date_release')).toBe('La fecha debe ser igual o mayor a la fecha actual');

			write('date_release', '2026-11-12');
			expect(getFieldError('date_release')).toBe('');
		});

		// la fecha de revision no la escribe el usuario, se calcula sola un año despues de la de liberacion
		it('deberia calcular la fecha de revision un año despues de la de liberacion', () => {
			write('date_release', '2026-12-01');

			expect(getInput('date_revision').value).toBe('2027-12-01');
			expect(getInput('date_revision').readOnly).toBe(true);
		});

		it('deberia crear el producto y volver al listado cuando todo esta bien', async () => {
			await fillValidForm();
			submit();

			const req = httpMock.expectOne('/bp/products');
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({
				id: 'trj-crd',
				name: 'Tarjetas de Crédito',
				description: 'Tarjeta de consumo bajo la modalidad de crédito',
				logo: 'https://www.assets.com/1.png',
				date_release: '2026-11-12',
				date_revision: '2027-11-12',
			});
			req.flush({ message: 'Product added successfully', data: req.request.body });

			expect(TestBed.inject(ToastService).toast()).toEqual({ message: 'Producto agregado correctamente', type: 'success' });
			expect(navigate).toHaveBeenCalledWith(['/products']);
		});

		// mientras el back responde el boton se bloquea para que no se cree dos veces por un doble click
		it('deberia bloquear el boton mientras se guarda', async () => {
			await fillValidForm();
			submit();

			expect(getButton('Guardando...').disabled).toBe(true);

			httpMock.expectOne('/bp/products').flush({ message: 'Product added successfully' });
		});

		// si el back responde con error el usuario se queda en el formulario viendo que paso, con sus datos intactos
		it('deberia mostrar el error y quedarse en el formulario si falla el guardado', async () => {
			await fillValidForm();
			submit();

			httpMock.expectOne('/bp/products').flush({ name: 'BadRequestError', message: 'Duplicate identifier found in the database' }, { status: 400, statusText: 'Bad Request' });
			fixture.detectChanges();

			expect(element.querySelector('[role="alert"]')?.textContent).toContain('Ya existe un producto con ese ID');
			expect(navigate).not.toHaveBeenCalled();
			expect(getInput('name').value).toBe('Tarjetas de Crédito');
			expect(getButton('Enviar').disabled).toBe(false);
		});

		it('deberia limpiar todos los campos y los errores al reiniciar', async () => {
			await fillValidForm();
			write('name', 'abc');

			getButton('Reiniciar').click();
			fixture.detectChanges();

			for (const id of ['id', 'name', 'description', 'logo', 'date_release', 'date_revision']) {
				expect(getInput(id).value).toBe('');
				expect(getFieldError(id)).toBe('');
			}
		});
	});

	describe('al editar un producto', () => {
		const PRODUCT: Product = {
			id: 'trj-crd',
			name: 'Tarjetas de Crédito',
			description: 'Tarjeta de consumo bajo la modalidad de crédito',
			logo: 'https://www.assets.com/1.png',
			date_release: '2026-12-01',
			date_revision: '2027-12-01',
		};

		function openEdit(): void {
			fixture.componentRef.setInput('id', 'trj-crd');
			fixture.detectChanges();
		}

		function answerProduct(product: Product = PRODUCT): void {
			httpMock.expectOne('/bp/products/trj-crd').flush(product);
			fixture.detectChanges();
		}

		// mientras llega el producto se ven los campos en gris y no un formulario vacio que confunda
		it('deberia mostrar el skeleton mientras se carga el producto', () => {
			openEdit();

			expect(element.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
			expect(element.querySelector('form')).toBeNull();

			answerProduct();
			expect(element.querySelectorAll('.animate-pulse').length).toBe(0);
			expect(element.querySelector('form')).not.toBeNull();
		});

		it('deberia cargar los datos del producto en el formulario', () => {
			openEdit();
			answerProduct();

			expect(element.querySelector('h1')?.textContent).toContain('Formulario de Edición');
			expect(getInput('id').value).toBe('trj-crd');
			expect(getInput('name').value).toBe('Tarjetas de Crédito');
			expect(getInput('description').value).toBe('Tarjeta de consumo bajo la modalidad de crédito');
			expect(getInput('logo').value).toBe('https://www.assets.com/1.png');
			expect(getInput('date_release').value).toBe('2026-12-01');
			expect(getInput('date_revision').value).toBe('2027-12-01');
		});

		// el id no se puede cambiar al editar, y como no cambia tampoco se vuelve a verificar contra el back
		it('deberia tener el campo id deshabilitado', async () => {
			openEdit();
			answerProduct();
			await jest.advanceTimersByTimeAsync(400);

			expect(getInput('id').disabled).toBe(true);
			httpMock.expectNone((req) => req.url.includes('/verification/'));
		});

		it('deberia mantener las mismas validaciones que al agregar', () => {
			openEdit();
			answerProduct();

			write('name', 'abc');
			write('description', '');
			write('date_release', '2026-11-01');

			expect(getFieldError('name')).toBe('El nombre debe tener entre 5 y 100 caracteres');
			expect(getFieldError('description')).toBe('Este campo es requerido!');
			expect(getFieldError('date_release')).toBe('La fecha debe ser igual o mayor a la fecha actual');
			expect(getButton('Enviar').disabled).toBe(true);
		});

		// un producto viejo puede tener la fecha de liberacion vencida, se avisa apenas abre para que sepa porque no puede enviar
		it('deberia marcar de una vez la fecha si el producto tiene una fecha que ya paso', () => {
			openEdit();
			answerProduct({ ...PRODUCT, date_release: '2025-01-01', date_revision: '2026-01-01' });

			expect(getFieldError('date_release')).toBe('La fecha debe ser igual o mayor a la fecha actual');
			expect(getButton('Enviar').disabled).toBe(true);
		});

		// al guardar el id viaja en la url y no en el cuerpo
		it('deberia actualizar el producto y volver al listado', () => {
			openEdit();
			answerProduct();
			write('name', 'Tarjeta Black');
			write('date_release', '2026-12-15');
			submit();

			const req = httpMock.expectOne('/bp/products/trj-crd');
			expect(req.request.method).toBe('PUT');
			expect(req.request.body).toEqual({
				name: 'Tarjeta Black',
				description: 'Tarjeta de consumo bajo la modalidad de crédito',
				logo: 'https://www.assets.com/1.png',
				date_release: '2026-12-15',
				date_revision: '2027-12-15',
			});
			req.flush({ message: 'Product updated successfully', data: req.request.body });

			expect(TestBed.inject(ToastService).toast()).toEqual({ message: 'Producto actualizado correctamente', type: 'success' });
			expect(navigate).toHaveBeenCalledWith(['/products']);
		});

		it('deberia mostrar el error si falla la actualizacion', () => {
			openEdit();
			answerProduct();
			write('name', 'Tarjeta Black');
			submit();

			httpMock.expectOne('/bp/products/trj-crd').flush({ name: 'NotFoundError', message: 'Not product found with that identifier' }, { status: 404, statusText: 'Not Found' });
			fixture.detectChanges();

			expect(element.querySelector('[role="alert"]')?.textContent).toContain('No se encontró un producto con ese ID');
			expect(navigate).not.toHaveBeenCalled();
		});

		// al editar, reiniciar no borra todo sino que regresa a como estaba guardado el producto
		it('deberia volver a los datos originales al reiniciar', () => {
			openEdit();
			answerProduct();
			write('name', 'Otro nombre cualquiera');
			write('logo', '');

			getButton('Reiniciar').click();
			fixture.detectChanges();

			expect(getInput('id').value).toBe('trj-crd');
			expect(getInput('name').value).toBe('Tarjetas de Crédito');
			expect(getInput('logo').value).toBe('https://www.assets.com/1.png');
			expect(getFieldError('logo')).toBe('');
		});

		// por ejemplo si entran con el link de un producto que ya fue eliminado
		it('deberia avisar si no se pudo cargar el producto y dejar reintentar', () => {
			openEdit();
			httpMock.expectOne('/bp/products/trj-crd').flush({ name: 'NotFoundError', message: 'Not product found with that identifier' }, { status: 404, statusText: 'Not Found' });
			fixture.detectChanges();

			expect(element.querySelector('[role="alert"]')?.textContent).toContain('No se encontró un producto con ese ID');
			expect(element.querySelector('form')).toBeNull();
			expect(element.querySelector('a[href="/products"]')?.textContent).toContain('Volver al listado');

			getButton('Reintentar').click();
			fixture.detectChanges();
			answerProduct();

			expect(getInput('name').value).toBe('Tarjetas de Crédito');
		});
	});
});
