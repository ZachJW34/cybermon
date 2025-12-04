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

export async function fetchJson<T>(url: string | URL, init?: RequestInit): Promise<T> {
	let response: Response;

	try {
		response = await fetch(url, init);
	} catch (error) {
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
		if (response.status === 204) {
			return {} as T;
		}
		const data = (await response.json()) as T;
		return data;
	} catch (error) {
		throw new HttpError(
			response.status,
			response.statusText,
			`Failed to parse response JSON: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
