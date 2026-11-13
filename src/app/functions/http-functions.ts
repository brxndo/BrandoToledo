import { HttpErrorResponse } from '@angular/common/http';
import { OperatorFunction, catchError, map, of } from 'rxjs';

export interface ApiResponse {
	ok: boolean;
	message?: string;
}

const NO_CONNECTION_STATUS = [0, 502, 503, 504];

const ERROR_MESSAGES: Record<number, string> = {
	400: 'Los datos enviados no son válidos',
	404: 'No se encontró el recurso solicitado',
	500: 'Ocurrió un error en el servidor',
};

const BACKEND_MESSAGES: Record<string, string> = {
	'Duplicate identifier found in the database': 'Ya existe un producto con ese ID',
	'Not product found with that identifier': 'No se encontró un producto con ese ID',
};

export function getErrorMessage(error: HttpErrorResponse): string {
	if (NO_CONNECTION_STATUS.includes(error.status)) return 'Sin conexión con el servidor';
	return BACKEND_MESSAGES[error.error?.message] ?? ERROR_MESSAGES[error.status] ?? 'Ocurrió un error inesperado';
}

export function toApiResponse<T extends ApiResponse>(): OperatorFunction<T, T> {
	return (source) =>
		source.pipe(
			map((resp) => ({ ...resp, ok: true })),
			catchError((e: HttpErrorResponse) => of({ ok: false, message: getErrorMessage(e) } as T))
		);
}
