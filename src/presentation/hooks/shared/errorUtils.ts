/**
 * Utilidades compartidas para manejo de errores en hooks
 */

export interface AppError {
  message: string;
  code?: string;
  field?: string;
}

/**
 * Extrae el mensaje de error de diferentes tipos de errores (Axios, Error estándar, string)
 */
export function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const axiosError = err as { 
      response?: { 
        data?: { 
          message?: string; 
          error?: string 
        } 
      } 
    };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return err.message;
  }
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

/**
 * Crea un objeto AppError a partir de un error desconocido
 */
export function createAppError(err: unknown, code?: string): AppError {
  return {
    message: extractErrorMessage(err),
    code,
  };
}
