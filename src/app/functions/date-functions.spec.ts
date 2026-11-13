import { addOneYear, getToday, toInputDate } from './date-functions';

describe('date-functions', () => {
	describe('toInputDate', () => {
		// los input de tipo fecha trabajan con año-mes-dia y siempre con dos digitos
		it('deberia convertir una fecha al formato de los input date', () => {
			expect(toInputDate(new Date(2026, 0, 5))).toBe('2026-01-05');
			expect(toInputDate(new Date(2026, 10, 12))).toBe('2026-11-12');
		});
	});

	describe('getToday', () => {
		afterEach(() => {
			jest.useRealTimers();
		});

		it('deberia devolver la fecha de hoy', () => {
			jest.useFakeTimers().setSystemTime(new Date(2026, 10, 12, 15, 30));

			expect(getToday()).toBe('2026-11-12');
		});

		// a las 11 de la noche todavia es el mismo dia para el usuario, no el siguiente
		it('deberia usar la fecha local y no la de UTC', () => {
			jest.useFakeTimers().setSystemTime(new Date(2026, 10, 12, 23, 30));

			expect(getToday()).toBe('2026-11-12');
		});
	});

	describe('addOneYear', () => {
		it('deberia sumar exactamente un año a la fecha', () => {
			expect(addOneYear('2026-02-22')).toBe('2027-02-22');
			expect(addOneYear('2026-12-31')).toBe('2027-12-31');
		});

		// el 29 de febrero no existe al año siguiente, se deja el 28
		it('deberia devolver el 28 de febrero si la fecha es un 29 de febrero', () => {
			expect(addOneYear('2028-02-29')).toBe('2029-02-28');
		});

		it('deberia devolver vacio si la fecha no esta completa', () => {
			expect(addOneYear('')).toBe('');
			expect(addOneYear('2026-02')).toBe('');
		});
	});
});
