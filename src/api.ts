export const API_BASE_URL = 'https://app.streamlingo.net/api'

export type StreamlingoAction = 'status' | 'start' | 'stop' | 'pause' | 'resume'

/**
 * The states reported by the Streamlingo API.
 * The API may report other values in the future, so any string is accepted.
 */
export type StreamlingoStatus = 'stopped' | 'starting' | 'waiting_for_input' | 'running' | 'paused'

export const KNOWN_STATUSES: { id: StreamlingoStatus; label: string }[] = [
	{ id: 'stopped', label: 'Stopped' },
	{ id: 'starting', label: 'Starting' },
	{ id: 'waiting_for_input', label: 'Waiting for audio' },
	{ id: 'running', label: 'Running' },
	{ id: 'paused', label: 'Paused' },
]

export function getStatusLabel(status: string): string {
	return KNOWN_STATUSES.find((s) => s.id === status)?.label ?? status
}

/**
 * Thrown when the API answers with HTTP 400.
 * Streamlingo uses HTTP 400 both for an unknown API key and for an action that is not allowed in the current state.
 */
export class StreamlingoRequestError extends Error {
	constructor(
		readonly httpStatus: number,
		message: string,
	) {
		super(message)
		this.name = 'StreamlingoRequestError'
	}
}

/**
 * Accepts either a bare API key, or any of the URLs shown in the Streamlingo settings, and returns the API key
 */
export function parseApiKey(input: string | undefined): string {
	const value = (input ?? '').trim()
	const match = /\/api\/([^/?#\s]+)/.exec(value)
	return match ? match[1] : value
}

/**
 * Call the Streamlingo API and return the new status.
 * The request is cancelled when any of the given signals aborts, or after the timeout.
 */
export async function callStreamlingo(
	apiKey: string,
	action: StreamlingoAction,
	timeoutMs: number,
	signals: (AbortSignal | undefined)[] = [],
): Promise<string> {
	const url = `${API_BASE_URL}/${encodeURIComponent(apiKey)}/${action}`

	// A per-request controller, so no listeners are left attached to the long-lived signals once the request is done
	const controller = new AbortController()
	const onAbort = (e: Event) => controller.abort((e.target as AbortSignal).reason)
	const sources = signals.filter((signal): signal is AbortSignal => !!signal)
	for (const signal of sources) {
		if (signal.aborted) controller.abort(signal.reason)
		else signal.addEventListener('abort', onAbort, { once: true })
	}
	const timeout = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs)

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: { Accept: 'application/json' },
			signal: controller.signal,
		})
		const body = await response.text()

		if (response.status === 400) {
			throw new StreamlingoRequestError(response.status, shorten(body) || response.statusText)
		}
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`.trim())
		}

		let parsed: unknown
		try {
			parsed = JSON.parse(body)
		} catch {
			throw new Error(`Unexpected response from Streamlingo: ${shorten(body)}`)
		}

		const newStatus = (parsed as { newStatus?: unknown } | null)?.newStatus
		if (typeof newStatus !== 'string') {
			throw new Error(`Unexpected response from Streamlingo: ${shorten(body)}`)
		}
		return newStatus
	} finally {
		clearTimeout(timeout)
		for (const signal of sources) signal.removeEventListener('abort', onAbort)
	}
}

function shorten(text: string): string {
	return text.trim().slice(0, 200)
}
