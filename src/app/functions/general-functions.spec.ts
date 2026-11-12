import { getInitials } from './general-functions';

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
});
