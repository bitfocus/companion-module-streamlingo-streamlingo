import type { SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	pollInterval: number
}

export type ModuleSecrets = {
	apiKey: string
}

export const DEFAULT_POLL_INTERVAL = 2000

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Information',
			width: 12,
			value:
				'In Streamlingo, open Settings → Integrations and enable "Remote Control via URL". ' +
				'Paste any of the URLs shown there (or just the key between /api/ and the action) into the field below. ' +
				'Streamlingo must remain open in a browser for translation to run.',
		},
		{
			type: 'secret-text',
			id: 'apiKey',
			label: 'API Key or Remote Control URL',
			width: 12,
			description: 'Example: https://app.streamlingo.net/api/AbCdEf123456/status',
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Status Poll Interval (ms)',
			width: 6,
			min: 500,
			max: 60000,
			step: 100,
			default: DEFAULT_POLL_INTERVAL,
			asInteger: true,
			clampValues: true,
		},
	]
}
