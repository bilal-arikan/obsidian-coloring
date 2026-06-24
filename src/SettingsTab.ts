import { Notice, PluginSettingTab, Setting } from 'obsidian'
import type FileColorPickerPlugin from './main'
import { generateId, normalizeHex } from './settings'
import { getSourceStatus, importFromFileColor } from './importer'

export class FileColorSettingTab extends PluginSettingTab {
	private importDisplayOptions = true

	constructor(private plugin: FileColorPickerPlugin) {
		super(plugin.app, plugin)
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		new Setting(containerEl)
			.setName('Color background')
			.setDesc('Color the row background instead of the text in the file explorer.')
			.addToggle((t) =>
				t.setValue(this.plugin.settings.colorBackground).onChange(async (v) => {
					this.plugin.settings.colorBackground = v
					await this.plugin.saveSettings()
					this.plugin.applier.applyFileExplorer()
				})
			)

		new Setting(containerEl)
			.setName('Cascade colors to children')
			.setDesc('Apply a folder color to all files and folders inside it.')
			.addToggle((t) =>
				t.setValue(this.plugin.settings.cascadeColors).onChange(async (v) => {
					this.plugin.settings.cascadeColors = v
					await this.plugin.saveSettings()
					this.plugin.applier.applyFileExplorer()
				})
			)

		new Setting(containerEl)
			.setName('Color the tab header')
			.setDesc("When you open a colored file, tint its tab title with the file's color.")
			.addToggle((t) =>
				t.setValue(this.plugin.settings.colorTabHeader).onChange(async (v) => {
					this.plugin.settings.colorTabHeader = v
					await this.plugin.saveSettings()
					this.plugin.applier.applyTabHeaders()
				})
			)

		// --- Palette management ---
		new Setting(containerEl).setName('Saved colors').setHeading()

		const palette = this.plugin.settings.palette
		if (!palette.length) {
			containerEl.createDiv({
				cls: 'file-color-empty',
				text: 'No saved colors yet. Right-click a file → "Set color" to add one.',
			})
		}

		palette.forEach((color) => {
			const setting = new Setting(containerEl)
			setting.controlEl.addClass('file-color-palette-row')

			setting.addColorPicker((picker) =>
				picker.setValue(color.value).onChange(async (v) => {
					const old = color.value
					color.value = v
					// Keep already-assigned files in sync with the edited swatch.
					this.plugin.settings.fileColors.forEach((fc) => {
						if (normalizeHex(fc.value) === normalizeHex(old)) fc.value = v
					})
					await this.plugin.saveSettings()
					this.plugin.applier.applyAll()
				})
			)

			setting.addText((text) =>
				text
					.setPlaceholder('Name')
					.setValue(color.name)
					.onChange(async (v) => {
						color.name = v
						await this.plugin.saveSettings()
					})
			)

			setting.addExtraButton((btn) =>
				btn
					.setIcon('trash')
					.setTooltip('Remove from palette')
					.onClick(async () => {
						this.plugin.settings.palette = this.plugin.settings.palette.filter(
							(c) => c.id !== color.id
						)
						await this.plugin.saveSettings()
						this.display()
					})
			)
		})

		new Setting(containerEl).addButton((btn) =>
			btn.setButtonText('Add color').onClick(async () => {
				this.plugin.settings.palette.push({
					id: generateId(),
					name: '',
					value: '#4caf50',
				})
				await this.plugin.saveSettings()
				this.display()
			})
		)

		// --- Maintenance ---
		new Setting(containerEl).setName('Maintenance').setHeading()

		new Setting(containerEl)
			.setName('Clear all file colors')
			.setDesc('Remove every color assignment. The saved palette is kept.')
			.addButton((btn) =>
				btn
					.setButtonText('Clear assignments')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.fileColors = []
						await this.plugin.saveSettings()
						this.plugin.applier.applyAll()
						this.display()
					})
			)

		// --- Import from the original "File Color" plugin ---
		new Setting(containerEl).setName('Import from "File Color" (ecustic)').setHeading()

		const statusEl = containerEl.createDiv({ cls: 'file-color-empty' })
		statusEl.setText('Checking this vault for the original "File Color" plugin…')
		this.refreshSourceStatus(statusEl)

		new Setting(containerEl)
			.setName('Also import display options')
			.setDesc('Copy the original cascade and background toggles as well.')
			.addToggle((t) =>
				t.setValue(this.importDisplayOptions).onChange((v) => {
					this.importDisplayOptions = v
				})
			)

		new Setting(containerEl)
			.setName('Import colors & assignments')
			.setDesc(
				'Read the palette and file colors from the original plugin in this vault and merge them in. Existing colors are kept; matching paths are updated.'
			)
			.addButton((btn) =>
				btn
					.setButtonText('Import now')
					.setCta()
					.onClick(async () => {
						const summary = await importFromFileColor(this.plugin, {
							importDisplayOptions: this.importDisplayOptions,
						})
						if (!summary.found) {
							new Notice('Original "File Color" plugin data not found in this vault.')
						} else {
							const skipped = summary.skipped
								? `, ${summary.skipped} skipped`
								: ''
							new Notice(
								`Imported ${summary.fileColorsImported} file colors, +${summary.paletteAdded} palette colors${skipped}.`
							)
						}
						this.display()
					})
			)
	}

	// Asynchronously update the status line with what the original plugin holds.
	private async refreshSourceStatus(el: HTMLElement): Promise<void> {
		const status = await getSourceStatus(this.plugin)
		if (!status.found) {
			el.setText('Original "File Color" plugin not found in this vault — nothing to import.')
			return
		}
		el.setText(
			`Found "File Color" data: ${status.paletteCount} palette colors, ${status.fileColorCount} file assignments.`
		)
	}
}
