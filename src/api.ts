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
 * Thrown when the API rejects a request.
 * Streamlingo answers with HTTP 400 both for an unknown API key and for an action that is not allowed in the current state.
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

export async function callStreamlingo(
	apiKey: string,
	action: StreamlingoAction,
	timeoutMs: number,
	signal?: AbortSignal,
): Promise<string> {
	const url = `${API_BASE_URL}/${encodeURIComponent(apiKey)}/${action}`
	const timeoutSignal = AbortSignal.timeout(timeoutMs)
	const response = await fetch(url, {
		method: 'GET',
		headers: { Accept: 'application/json' },
		signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
	})

	const body = await response.text()
	if (!response.ok) {
		throw new StreamlingoRequestError(response.status, body.trim() || response.statusText)
	}

	let parsed: unknown
	try {
		parsed = JSON.parse(body)
	} catch {
		throw new Error(`Unexpected response from Streamlingo: ${body.slice(0, 100)}`)
	}

	const newStatus = (parsed as { newStatus?: unknown } | null)?.newStatus
	if (typeof newStatus !== 'string') {
		throw new Error(`Unexpected response from Streamlingo: ${body.slice(0, 100)}`)
	}
	return newStatus
}
