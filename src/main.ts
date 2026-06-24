import { Debouncer, MenuItem, Plugin, debounce } from 'obsidian'
import { ColorApplier } from './colorApplier'
import { SetColorModal } from './SetColorModal'
import { FileColorSettingTab } from './SettingsTab'
import { DEFAULT_SETTINGS, FileColorPickerSettings } from './settings'

export default class FileColorPickerPlugin extends Plugin {
	settings: FileColorPickerSettings = DEFAULT_SETTINGS
	applier!: ColorApplier

	private saveData_ = debounce(() => this.saveData(this.settings), 300, true) as Debouncer<
		[],
		Promise<void>
	>

	async onload(): Promise<void> {
		await this.loadSettings()
		this.applier = new ColorApplier(this)

		// Right-click context menu entry for files and folders.
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item: MenuItem) => {
					item
						.setTitle('Set color')
						.setIcon('palette')
						.onClick(() => new SetColorModal(this, file).open())
				})
			})
		)

		// Apply on startup and whenever the layout/active file changes.
		this.app.workspace.onLayoutReady(() => this.applier.applyAll())
		this.registerEvent(
			this.app.workspace.on('layout-change', () => this.applier.applyAll())
		)
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => this.applier.applyTabHeaders())
		)
		this.registerEvent(
			this.app.workspace.on('file-open', () => this.applier.applyTabHeaders())
		)

		// Keep assignments in sync with the vault.
		this.registerEvent(
			this.app.vault.on('rename', async (file, oldPath) => {
				this.settings.fileColors.forEach((fc) => {
					if (fc.path === oldPath) fc.path = file.path
					else if (fc.path.startsWith(oldPath + '/')) {
						fc.path = file.path + fc.path.slice(oldPath.length)
					}
				})
				await this.saveSettings()
				this.applier.applyAll()
			})
		)
		this.registerEvent(
			this.app.vault.on('delete', async (file) => {
				this.settings.fileColors = this.settings.fileColors.filter(
					(fc) => fc.path !== file.path && !fc.path.startsWith(file.path + '/')
				)
				await this.saveSettings()
			})
		)

		this.addSettingTab(new FileColorSettingTab(this))
	}

	onunload(): void {
		this.applier?.clearAll()
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings(): Promise<void> {
		await this.saveData_()
	}
}
