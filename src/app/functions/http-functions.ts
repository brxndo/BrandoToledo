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

export function getErrorMessage(error: HttpErrorResponse): string {
	if (NO_CONNECTION_STATUS.includes(error.status)) return 'Sin conexión con el servidor';
	return ERROR_MESSAGES[error.status] ?? 'Ocurrió un error inesperado';
}

export function toApiResponse<T extends ApiResponse>(): OperatorFunction<T, T> {
	return (source) =>
		source.pipe(
			map((resp) => ({ ...resp, ok: true })),
			catchError((e: HttpErrorResponse) => of({ ok: false, message: getErrorMessage(e) } as T))
		);
}
