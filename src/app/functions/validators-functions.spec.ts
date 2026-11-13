import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { ProductVerification } from '../interfaces/products.interface';
import { oneYearAfterValidator, todayOrLaterValidator, uniqueIdValidator } from './validators-functions';

describe('validators-functions', () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date(2026, 10, 12, 10, 0));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('todayOrLaterValidator', () => {
		// la fecha de liberacion puede ser hoy mismo o cualquier dia despues
		it('deberia aceptar la fecha de hoy y las fechas futuras', () => {
			const validator = todayOrLaterValidator();

			expect(validator(new FormControl('2026-11-12'))).toBeNull();
			expect(validator(new FormControl('2027-01-01'))).toBeNull();
		});

		it('deberia rechazar una fecha anterior a hoy', () => {
			const validator = todayOrLaterValidator();

			expect(validator(new FormControl('2026-11-11'))).toEqual({ beforeToday: true });
		});

		// de que el campo no este vacio se encarga el required, aqui no se repite ese error
		it('no deberia marcar error si el campo esta vacio', () => {
			expect(todayOrLaterValidator()(new FormControl(''))).toBeNull();
		});
	});

	describe('oneYearAfterValidator', () => {
		function buildGroup(release: string, revision: string): FormGroup {
			return new FormGroup({ date_release: new FormControl(release), date_revision: new FormControl(revision) });
		}

		const validator = oneYearAfterValidator('date_release', 'date_revision');

		it('deberia aceptar cuando la revision es justo un año despues', () => {
			expect(validator(buildGroup('2026-11-12', '2027-11-12'))).toBeNull();
		});

		// ni un dia antes ni un dia despues, tiene que ser exactamente el año
		it('deberia rechazar cualquier otra fecha de revision', () => {
			expect(validator(buildGroup('2026-11-12', '2027-11-13'))).toEqual({ oneYearAfter: true });
			expect(validator(buildGroup('2026-11-12', '2027-11-11'))).toEqual({ oneYearAfter: true });
			expect(validator(buildGroup('2026-11-12', '2026-11-12'))).toEqual({ oneYearAfter: true });
		});

		it('no deberia marcar error mientras falte alguna de las dos fechas', () => {
			expect(validator(buildGroup('', '2027-11-12'))).toBeNull();
			expect(validator(buildGroup('2026-11-12', ''))).toBeNull();
		});
	});

	describe('uniqueIdValidator', () => {
		function validate(response: ProductVerification): { result: () => ValidationErrors | null | undefined; verifyId: jest.Mock } {
			const verifyId = jest.fn(() => of(response));
			let errors: ValidationErrors | null | undefined;
			(uniqueIdValidator(verifyId)(new FormControl('trj-crd')) as Observable<ValidationErrors | null>).subscribe((value) => (errors = value));
			return { result: () => errors, verifyId };
		}

		// espera un momento antes de preguntar al back para no hacer una peticion por cada letra
		it('deberia esperar antes de consultar el servicio', () => {
			const { verifyId } = validate({ ok: true, exists: false });

			jest.advanceTimersByTime(300);
			expect(verifyId).not.toHaveBeenCalled();

			jest.advanceTimersByTime(100);
			expect(verifyId).toHaveBeenCalledWith('trj-crd');
		});

		it('deberia marcar error si el id ya existe', () => {
			const { result } = validate({ ok: true, exists: true });
			jest.advanceTimersByTime(400);

			expect(result()).toEqual({ idExists: true });
		});

		it('no deberia marcar error si el id esta libre', () => {
			const { result } = validate({ ok: true, exists: false });
			jest.advanceTimersByTime(400);

			expect(result()).toBeNull();
		});

		// si el back no responde no se puede asegurar que el id este libre, asi que tampoco se deja pasar
		it('deberia avisar cuando no se pudo verificar el id', () => {
			const { result } = validate({ ok: false, message: 'Sin conexión con el servidor' });
			jest.advanceTimersByTime(400);

			expect(result()).toEqual({ idNotVerified: true });
		});
	});
});
