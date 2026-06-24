import { Modal, TAbstractFile } from 'obsidian'
import type FileColorPickerPlugin from './main'
import { generateId, normalizeHex } from './settings'

// Right-click "Set color" modal: pick from saved colors or choose a new one.
export class SetColorModal extends Modal {
	private gridEl!: HTMLElement

	constructor(private plugin: FileColorPickerPlugin, private file: TAbstractFile) {
		super(plugin.app)
	}

	private get currentColor(): string | undefined {
		return this.plugin.settings.fileColors.find((fc) => fc.path === this.file.path)?.value
	}

	onOpen(): void {
		const { contentEl } = this
		contentEl.empty()
		contentEl.addClass('file-color-picker-modal')

		contentEl.createEl('h3', { text: `Set color — ${this.file.name}` })

		// --- Saved colors grid ---
		contentEl.createDiv({ cls: 'file-color-section-label', text: 'Saved colors' })
		this.gridEl = contentEl.createDiv({ cls: 'file-color-grid' })
		this.renderGrid()

		// --- Pick a new color ---
		contentEl.createDiv({ cls: 'file-color-section-label', text: 'Pick a new color' })
		const addRow = contentEl.createDiv({ cls: 'file-color-add-row' })

		const colorInput = addRow.createEl('input', { type: 'color' })
		colorInput.addClass('file-color-input')
		colorInput.value = this.currentColor ?? '#4caf50'

		const nameInput = addRow.createEl('input', { type: 'text', cls: 'file-color-name-input' })
		nameInput.placeholder = 'Optional name'

		const addBtn = addRow.createEl('button', { text: 'Add & apply', cls: 'mod-cta' })
		addBtn.onclick = async () => {
			await this.addAndApply(colorInput.value, nameInput.value.trim())
		}

		// --- Footer ---
		const footer = contentEl.createDiv({ cls: 'file-color-footer' })
		if (this.currentColor) {
			const clearBtn = footer.createEl('button', { text: 'Remove color' })
			clearBtn.addClass('mod-warning')
			clearBtn.onclick = async () => {
				await this.applyColor(undefined)
				this.close()
			}
		}
		const cancelBtn = footer.createEl('button', { text: 'Cancel' })
		cancelBtn.onclick = () => this.close()
	}

	private renderGrid(): void {
		const grid = this.gridEl
		grid.empty()

		const palette = this.plugin.settings.palette
		if (!palette.length) {
			grid.createDiv({
				cls: 'file-color-empty',
				text: 'No saved colors yet — pick one below to start your palette.',
			})
			return
		}

		const current = this.currentColor
		palette.forEach((color) => {
			const cell = grid.createDiv({ cls: 'file-color-cell' })
			cell.style.backgroundColor = color.value
			cell.setAttr('aria-label', color.name || color.value)
			if (current && normalizeHex(current) === normalizeHex(color.value)) {
				cell.addClass('is-selected')
			}
			cell.onclick = async () => {
				await this.applyColor(color.value)
				this.close()
			}

			// Per-cell delete button (removes from palette only).
			const del = cell.createDiv({ cls: 'file-color-cell-delete', text: '×' })
			del.setAttr('aria-label', 'Remove from palette')
			del.onclick = async (e) => {
				e.stopPropagation()
				this.plugin.settings.palette = palette.filter((c) => c.id !== color.id)
				await this.plugin.saveSettings()
				this.renderGrid()
			}
		})
	}

	// Save the new color into the palette and apply it to the file.
	private async addAndApply(value: string, name: string): Promise<void> {
		const palette = this.plugin.settings.palette
		const existing = palette.find((c) => normalizeHex(c.value) === normalizeHex(value))

		if (existing) {
			if (name) existing.name = name
		} else {
			palette.push({ id: generateId(), name: name || value, value })
			const max = this.plugin.settings.maxPaletteColors
			if (palette.length > max) {
				this.plugin.settings.palette = palette.slice(palette.length - max)
			}
		}

		await this.applyColor(value)
		this.close()
	}

	// Assign (or clear) the color on the current file path.
	private async applyColor(value: string | undefined): Promise<void> {
		const fileColors = this.plugin.settings.fileColors
		const idx = fileColors.findIndex((fc) => fc.path === this.file.path)

		if (value) {
			if (idx >= 0) fileColors[idx].value = value
			else fileColors.push({ path: this.file.path, value })
		} else if (idx >= 0) {
			fileColors.splice(idx, 1)
		}

		await this.plugin.saveSettings()
		this.plugin.applier.applyAll()
	}

	onClose(): void {
		this.contentEl.empty()
	}
}
