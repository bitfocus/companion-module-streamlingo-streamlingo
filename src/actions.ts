import type ModuleInstance from './main.js'

type NoOptions = { options: Record<string, never> }

export type ActionsSchema = {
	start: NoOptions
	stop: NoOptions
	pause: NoOptions
	resume: NoOptions
	toggle_pause: NoOptions
	toggle_start_stop: NoOptions
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		start: {
			name: 'Start translation',
			options: [],
			callback: async (_action, context) => {
				await self.sendCommand('start', context.signal)
			},
		},
		stop: {
			name: 'Stop translation',
			options: [],
			callback: async (_action, context) => {
				await self.sendCommand('stop', context.signal)
			},
		},
		pause: {
			name: 'Pause translation',
			options: [],
			callback: async (_action, context) => {
				await self.sendCommand('pause', context.signal)
			},
		},
		resume: {
			name: 'Resume translation',
			options: [],
			callback: async (_action, context) => {
				await self.sendCommand('resume', context.signal)
			},
		},
		toggle_pause: {
			name: 'Toggle pause / resume',
			description: 'Pauses when running, resumes when paused. Does nothing in any other state.',
			options: [],
			callback: async (_action, context) => {
				if (self.status === 'running') {
					await self.sendCommand('pause', context.signal)
				} else if (self.status === 'paused') {
					await self.sendCommand('resume', context.signal)
				} else {
					self.log('info', `Cannot toggle pause while translation is ${self.status}`)
				}
			},
		},
		toggle_start_stop: {
			name: 'Toggle start / stop',
			description: 'Starts when stopped, otherwise stops. Does nothing while the status is unknown.',
			options: [],
			callback: async (_action, context) => {
				if (self.status === 'stopped') {
					await self.sendCommand('start', context.signal)
				} else if (self.status === 'unknown' || self.status === '') {
					self.log('info', 'Cannot toggle start / stop while the translation status is unknown')
				} else {
					await self.sendCommand('stop', context.signal)
				}
			},
		},
	})
}
