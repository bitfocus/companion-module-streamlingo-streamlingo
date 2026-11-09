import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { callStreamlingo, getStatusLabel, parseApiKey, StreamlingoRequestError, type StreamlingoAction } from './api.js'
import { DEFAULT_POLL_INTERVAL, GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

const REQUEST_TIMEOUT = 5000
/** How soon to poll again after a command, so transitional states (e.g. starting) are picked up quickly */
const POLL_AFTER_COMMAND_DELAY = 500

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()

	/** The last status reported by Streamlingo, or 'unknown' when it cannot be reached */
	status = ''

	#apiKey = ''
	#pollTimer: NodeJS.Timeout | undefined
	#abort: AbortController | undefined
	#lastPollError: string | undefined

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions

		await this.configUpdated(config, secrets)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.#stopPolling()
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.#apiKey = parseApiKey(secrets?.apiKey)

		this.#stopPolling()
		this.#setStatus('unknown')
		this.#lastPollError = undefined
		this.updatePresets() // the connection label may have changed

		if (!this.#apiKey) {
			this.updateStatus(InstanceStatus.BadConfig, 'API key is required')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.#abort = new AbortController()
		void this.#poll()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	/**
	 * Send a control command to Streamlingo, and update the status from the response
	 */
	async sendCommand(action: Exclude<StreamlingoAction, 'status'>): Promise<void> {
		if (!this.#apiKey) {
			this.log('warn', `Cannot ${action}: no API key configured`)
			return
		}

		try {
			const newStatus = await callStreamlingo(this.#apiKey, action, REQUEST_TIMEOUT, this.#abort?.signal)
			this.#setStatus(newStatus)
		} catch (e) {
			if (e instanceof StreamlingoRequestError) {
				// Streamlingo rejects commands that are not valid for the current state, e.g. pausing while stopped
				this.log('warn', `Streamlingo rejected "${action}" while translation is ${this.status}: ${e.message}`)
			} else if (!this.#abort?.signal.aborted) {
				this.log('error', `Failed to send "${action}": ${errorMessage(e)}`)
			}
		}

		this.#schedulePoll(POLL_AFTER_COMMAND_DELAY)
	}

	#setStatus(status: string): void {
		if (status === this.status) return
		this.status = status
		this.setVariableValues({
			status,
			status_text: status === 'unknown' ? 'Unknown' : getStatusLabel(status),
		})
		this.checkFeedbacks('status')
	}

	async #poll(): Promise<void> {
		const signal = this.#abort?.signal
		if (!signal || signal.aborted) return

		try {
			const status = await callStreamlingo(this.#apiKey, 'status', REQUEST_TIMEOUT, signal)
			if (signal.aborted) return

			this.#setStatus(status)
			if (this.#lastPollError !== undefined) this.log('info', 'Connection to Streamlingo restored')
			this.#lastPollError = undefined
			this.updateStatus(InstanceStatus.Ok)
		} catch (e) {
			if (signal.aborted) return

			const message = errorMessage(e)
			if (message !== this.#lastPollError) {
				this.log('error', `Status request failed: ${message}`)
			}
			this.#lastPollError = message
			this.#setStatus('unknown')

			if (e instanceof StreamlingoRequestError) {
				this.updateStatus(InstanceStatus.BadConfig, 'API key rejected. Check that Remote Control via URL is enabled.')
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure, message)
			}
		}

		this.#schedulePoll(this.config.pollInterval || DEFAULT_POLL_INTERVAL)
	}

	#schedulePoll(delay: number): void {
		if (!this.#abort || this.#abort.signal.aborted) return
		if (this.#pollTimer) clearTimeout(this.#pollTimer)
		this.#pollTimer = setTimeout(() => {
			this.#pollTimer = undefined
			void this.#poll()
		}, delay)
	}

	#stopPolling(): void {
		this.#abort?.abort()
		this.#abort = undefined
		if (this.#pollTimer) {
			clearTimeout(this.#pollTimer)
			this.#pollTimer = undefined
		}
	}
}

function errorMessage(e: unknown): string {
	if (e instanceof Error) {
		if (e.name === 'TimeoutError') return 'Request timed out'
		const cause = (e as { cause?: unknown }).cause
		if (cause instanceof Error) return `${e.message} (${cause.message})`
		return e.message
	}
	return String(e)
}
