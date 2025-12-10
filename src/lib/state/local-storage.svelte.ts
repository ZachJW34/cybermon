type Serializer<T> = (value: T) => string;
type Deserializer<T> = (value: string) => T;

type Transforms<T> = {
	serializer: Serializer<T>;
	deserializer: Deserializer<T>;
};

export const ObjectTransforms: Transforms<any> = {
	serializer(value) {
		return JSON.stringify(value);
	},
	deserializer(value: string) {
		return JSON.parse(value);
	}
};

export const BooleanTransforms: Transforms<any> = {
	serializer(value) {
		return String(value);
	},
	deserializer(value) {
		return value === 'true';
	}
};

export const StringTranforms: Transforms<any> = {
	serializer(value) {
		return value;
	},
	deserializer(value) {
		return value;
	}
};

export class LocalStorageState<T> {
	key: string;
	#value: T;
	#transforms: Transforms<T>;
	#fallback: () => T;

	constructor(key: string, fallback: T | (() => T), transforms: Transforms<T> = ObjectTransforms) {
		this.key = key;
		this.#transforms = transforms;
		this.#fallback = typeof fallback === 'function' ? (fallback as any) : () => fallback;
		this.#value = $state(this.#getLS() || this.#fallback());
	}

	get value() {
		return this.#value;
	}

	set value(value: T) {
		this.#value = value;
		this.#setLS();
	}

	update(fn: () => void) {
		fn();
		this.#setLS();
	}

	#getLS(): T | null {
		let value = localStorage.getItem(this.key);
		if (!value) return null;

		return this.#transforms.deserializer(value);
	}

	#setLS() {
		if (this.#value === null) {
			return localStorage.removeItem(this.key);
		}

		localStorage.setItem(this.key, this.#transforms.serializer(this.value));
	}
}
