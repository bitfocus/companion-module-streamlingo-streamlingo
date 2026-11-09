import type ModuleInstance from './main.js'

export type VariablesSchema = {
	status: string
	status_text: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({
		status: { name: 'Translation status (raw value, e.g. running)' },
		status_text: { name: 'Translation status (display text, e.g. Running)' },
	})
}
