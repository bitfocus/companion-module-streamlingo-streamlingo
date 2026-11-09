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
			callback: async () => {
				await self.sendCommand('start')
			},
		},
		stop: {
			name: 'Stop translation',
			options: [],
			callback: async () => {
				await self.sendCommand('stop')
			},
		},
		pause: {
			name: 'Pause translation',
			options: [],
			callback: async () => {
				await self.sendCommand('pause')
			},
		},
		resume: {
			name: 'Resume translation',
			options: [],
			callback: async () => {
				await self.sendCommand('resume')
			},
		},
		toggle_pause: {
			name: 'Toggle pause / resume',
			description: 'Pauses when running, resumes when paused. Does nothing in any other state.',
			options: [],
			callback: async () => {
				if (self.status === 'running') {
					await self.sendCommand('pause')
				} else if (self.status === 'paused') {
					await self.sendCommand('resume')
				} else {
					self.log('info', `Cannot toggle pause while translation is ${self.status}`)
				}
			},
		},
		toggle_start_stop: {
			name: 'Toggle start / stop',
			description: 'Starts when stopped, otherwise stops.',
			options: [],
			callback: async () => {
				await self.sendCommand(self.status === 'stopped' ? 'start' : 'stop')
			},
		},
	})
}
