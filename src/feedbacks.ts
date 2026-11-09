import { combineRgb } from '@companion-module/base'
import { KNOWN_STATUSES, type StreamlingoStatus } from './api.js'
import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	status: {
		type: 'boolean'
		options: {
			status: StreamlingoStatus
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		status: {
			name: 'Translation status',
			description: 'Change the button style when the translation is in the selected state',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'status',
					type: 'dropdown',
					label: 'Status',
					default: 'running',
					choices: KNOWN_STATUSES.map((s) => ({ id: s.id, label: s.label })),
				},
			],
			callback: (feedback) => self.status === feedback.options.status,
		},
	})
}
