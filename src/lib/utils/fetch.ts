export class HttpError extends Error {
	public status: number;
	public statusText: string;

	constructor(status: number, statusText: string, message?: string) {
		super(message || statusText);
		this.name = 'HttpError';
		this.status = status;
		this.statusText = statusText;
	}
}

interface FetchOptions extends RequestInit {
	timeout?: number;
}

export async function fetchJson<T>(url: string | URL, options: FetchOptions = {}): Promise<T> {
	const { timeout, ...init } = options;

	let signal = init.signal;

	if (timeout) {
		if (AbortSignal.timeout) {
			const timeoutSignal = AbortSignal.timeout(timeout);
			signal = timeoutSignal;
		} else {
			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), timeout);
			signal = controller.signal;
		}
	}

	let response: Response;

	try {
		response = await fetch(url, { ...init, signal });
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new HttpError(408, 'Request Timeout', 'The request took too long to complete.');
			}
			if (error.name === 'TimeoutError') {
				throw new HttpError(408, 'Request Timeout', 'The request timed out.');
			}
		}

		throw new HttpError(0, 'Network Error', error instanceof Error ? error.message : String(error));
	}

	if (!response.ok) {
		let errorMessage: string | undefined;
		try {
			const errorBody = await response.json();
			errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
		} catch {
			errorMessage = response.statusText;
		}
		throw new HttpError(response.status, response.statusText, errorMessage);
	}

	try {
		if (response.status === 204) return {} as T;
		return (await response.json()) as T;
	} catch (error) {
		throw new HttpError(
			response.status,
			response.statusText,
			`Failed to parse response JSON: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
