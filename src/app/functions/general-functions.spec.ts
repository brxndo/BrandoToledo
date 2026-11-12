import { getInitials, getTotalPages, paginate } from './general-functions';

describe('general-functions', () => {
	describe('getInitials', () => {
		// se usa la primera y la ultima palabra para que no salgan cosas como "TD" en "Tarjetas de Crédito"
		it('deberia tomar la inicial de la primera y la ultima palabra', () => {
			expect(getInitials('Tarjetas de Crédito')).toBe('TC');
			expect(getInitials('cuenta de ahorros')).toBe('CA');
		});

		it('deberia usar las dos primeras letras si solo hay una palabra', () => {
			expect(getInitials('Hipotecario')).toBe('HI');
		});

		// por si el nombre viene con espacios de mas o directamente vacio
		it('no deberia fallar con espacios extras o texto vacio', () => {
			expect(getInitials('   Credito    Auto  ')).toBe('CA');
			expect(getInitials('')).toBe('');
			expect(getInitials('   ')).toBe('');
		});
	});

	describe('paginate', () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

		it('deberia devolver solo los elementos de la pagina pedida', () => {
			expect(paginate(items, 1, 5)).toEqual([1, 2, 3, 4, 5]);
			expect(paginate(items, 2, 5)).toEqual([6, 7, 8, 9, 10]);
		});

		// la ultima pagina casi nunca sale completa
		it('deberia devolver lo que sobra en la ultima pagina', () => {
			expect(paginate(items, 3, 5)).toEqual([11, 12]);
		});

		it('deberia devolver una lista vacia si la pagina no existe', () => {
			expect(paginate(items, 4, 5)).toEqual([]);
			expect(paginate([], 1, 5)).toEqual([]);
		});
	});

	describe('getTotalPages', () => {
		it('deberia calcular cuantas paginas hacen falta', () => {
			expect(getTotalPages(12, 5)).toBe(3);
			expect(getTotalPages(10, 5)).toBe(2);
			expect(getTotalPages(3, 20)).toBe(1);
		});

		// aunque no haya nada se cuenta como una pagina, para que no salga un "1 de 0"
		it('deberia devolver 1 cuando no hay elementos', () => {
			expect(getTotalPages(0, 5)).toBe(1);
		});
	});
});
