import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiResponse, getErrorMessage, toApiResponse } from './http-functions';

interface FakeResponse extends ApiResponse {
	data?: string[];
}

describe('http-functions', () => {
	describe('toApiResponse', () => {
		// el back no manda el ok, asi que se lo ponemos nosotros cuando todo sale bien
		it('deberia marcar la respuesta como ok cuando no hay error', async () => {
			const resp = await firstValueFrom(of({ data: ['uno', 'dos'] } as FakeResponse).pipe(toApiResponse()));

			expect(resp.ok).toBe(true);
			expect(resp.data).toEqual(['uno', 'dos']);
		});

		// si la peticion falla no debe reventar, tiene que llegar como una respuesta normal pero con ok en false
		it('deberia devolver ok en false cuando la peticion falla', async () => {
			const error = new HttpErrorResponse({ status: 500 });
			const resp = await firstValueFrom(throwError(() => error).pipe(toApiResponse<FakeResponse>()));

			expect(resp.ok).toBe(false);
			expect(resp.message).toBe('Ocurrió un error en el servidor');
		});
	});

	describe('getErrorMessage', () => {
		// status 0 es cuando ni siquiera hubo respueta, por ejemplo si el back esta apagado
		it('deberia avisar que no hay conexion cuando el status es 0', () => {
			expect(getErrorMessage(new HttpErrorResponse({ status: 0 }))).toBe('Sin conexión con el servidor');
		});

		// con el proxy del ng serve el back apagado llega como 502 y para el usuario es lo mismo
		it('deberia tratar el 502 igual que si no hubiera conexion', () => {
			expect(getErrorMessage(new HttpErrorResponse({ status: 502 }))).toBe('Sin conexión con el servidor');
		});

		it('deberia tener un mensaje para los errores 400 y 404', () => {
			expect(getErrorMessage(new HttpErrorResponse({ status: 400 }))).toBe('Los datos enviados no son válidos');
			expect(getErrorMessage(new HttpErrorResponse({ status: 404 }))).toBe('No se encontró el recurso solicitado');
		});

		// para cualquier otro codigo que no tengamos mapeado
		it('deberia usar un mensaje generico si no conoce el status', () => {
			expect(getErrorMessage(new HttpErrorResponse({ status: 418 }))).toBe('Ocurrió un error inesperado');
		});
	});
});
