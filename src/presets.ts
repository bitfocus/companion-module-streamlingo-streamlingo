import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type { StreamlingoStatus } from './api.js'
import type ModuleInstance from './main.js'
import type { ModuleSchema } from './main.js'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const GREEN = combineRgb(0, 153, 0)
const RED = combineRgb(204, 0, 0)
const AMBER = combineRgb(230, 160, 0)
const BLUE = combineRgb(0, 102, 204)

function statusFeedback(status: StreamlingoStatus, bgcolor: number, color = WHITE) {
	return {
		feedbackId: 'status',
		options: { status },
		style: { bgcolor, color },
	} as const
}

export function UpdatePresets(self: ModuleInstance): void {
	const statusVar = `$(${self.label}:status_text)`

	const presets: CompanionPresetDefinitions<ModuleSchema> = {
		start: {
			type: 'simple',
			name: 'Start translation',
			style: { text: 'START', size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [{ down: [{ actionId: 'start', options: {} }], up: [] }],
			feedbacks: [
				statusFeedback('starting', AMBER, BLACK),
				statusFeedback('waiting_for_input', AMBER, BLACK),
				statusFeedback('running', GREEN),
			],
		},
		stop: {
			type: 'simple',
			name: 'Stop translation',
			style: { text: 'STOP', size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [{ down: [{ actionId: 'stop', options: {} }], up: [] }],
			feedbacks: [statusFeedback('stopped', RED)],
		},
		pause: {
			type: 'simple',
			name: 'Pause translation',
			style: { text: 'PAUSE', size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [{ down: [{ actionId: 'pause', options: {} }], up: [] }],
			feedbacks: [statusFeedback('paused', AMBER, BLACK)],
		},
		resume: {
			type: 'simple',
			name: 'Resume translation',
			style: { text: 'RESUME', size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [{ down: [{ actionId: 'resume', options: {} }], up: [] }],
			feedbacks: [statusFeedback('running', GREEN)],
		},
		toggle_start_stop: {
			type: 'simple',
			name: 'Start / stop toggle with status',
			style: { text: `START / STOP\\n${statusVar}`, size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [{ down: [{ actionId: 'toggle_start_stop', options: {} }], up: [] }],
			feedbacks: [
				statusFeedback('starting', AMBER, BLACK),
				statusFeedback('waiting_for_input', AMBER, BLACK),
				statusFeedback('running', GREEN),
				statusFeedback('paused', BLUE),
			],
		},
		toggle_pause: {
			type: 'simple',
			name: 'Pause / resume toggle with status',
			style: { text: `PAUSE / RESUME\\n${statusVar}`, size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [{ down: [{ actionId: 'toggle_pause', options: {} }], up: [] }],
			feedbacks: [statusFeedback('running', GREEN), statusFeedback('paused', AMBER, BLACK)],
		},
		status: {
			type: 'simple',
			name: 'Status display',
			style: { text: statusVar, size: 'auto', color: WHITE, bgcolor: BLACK },
			steps: [],
			feedbacks: [
				statusFeedback('stopped', RED),
				statusFeedback('starting', AMBER, BLACK),
				statusFeedback('waiting_for_input', AMBER, BLACK),
				statusFeedback('running', GREEN),
				statusFeedback('paused', BLUE),
			],
		},
	}

	const structure: CompanionPresetSection<ModuleSchema>[] = [
		{
			id: 'control',
			name: 'Translation control',
			definitions: [
				{
					id: 'control_buttons',
					type: 'simple',
					name: 'Individual commands',
					presets: ['start', 'stop', 'pause', 'resume'],
				},
				{
					id: 'toggle_buttons',
					type: 'simple',
					name: 'Toggles with status',
					presets: ['toggle_start_stop', 'toggle_pause', 'status'],
				},
			],
		},
	]

	self.setPresetDefinitions(structure, presets)
}
