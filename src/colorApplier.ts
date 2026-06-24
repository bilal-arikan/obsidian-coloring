import { normalizeHex } from './settings'
import type FileColorPickerPlugin from './main'
import type { FileExplorerLeaf, TabHeaderLeaf } from './obsidian-internals'

// Applies the configured colors to the file explorer and tab headers.
export class ColorApplier {
	constructor(private plugin: FileColorPickerPlugin) {}

	getColorForPath(path: string): string | undefined {
		return this.plugin.settings.fileColors.find((fc) => fc.path === path)?.value
	}

	applyAll(): void {
		this.applyFileExplorer()
		this.applyTabHeaders()
	}

	// Color file/folder rows in the file explorer.
	applyFileExplorer(): void {
		const { settings } = this.plugin
		const type = settings.colorBackground ? 'background' : 'text'

		const explorers = this.plugin.app.workspace.getLeavesOfType(
			'file-explorer'
		) as FileExplorerLeaf[]

		explorers.forEach((explorer) => {
			const fileItems = explorer.view?.fileItems
			if (!fileItems) return

			Object.entries(fileItems).forEach(([path, item]) => {
				const el = item.el
				// Drop any classes this plugin previously added.
				const classes = el.classList.value
					.split(' ')
					.filter((cls) => cls && !cls.startsWith('file-color'))

				const color = this.getColorForPath(path)
				if (color) {
					classes.push('file-color-file', `file-color-type-${type}`)
					if (settings.cascadeColors) classes.push('file-color-cascade')
					// Custom properties inherit, so cascade works for children too.
					el.style.setProperty('--file-color-color', color)
				} else {
					el.style.removeProperty('--file-color-color')
				}

				el.classList.value = classes.join(' ')
			})
		})
	}

	// Tint the tab header of every open colored file.
	applyTabHeaders(): void {
		const enabled = this.plugin.settings.colorTabHeader

		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			const tabLeaf = leaf as TabHeaderLeaf
			const titleEl = tabLeaf.tabHeaderInnerTitleEl
			const tabEl = tabLeaf.tabHeaderEl
			const iconEl = tabLeaf.tabHeaderInnerIconEl
			if (!titleEl) return

			const path = tabLeaf.view?.file?.path
			const color = enabled && path ? this.getColorForPath(path) : undefined

			if (color) {
				titleEl.style.color = color
				if (iconEl) iconEl.style.color = color
				if (tabEl) {
					tabEl.classList.add('file-color-tab')
					tabEl.style.setProperty('--file-color-color', color)
				}
			} else {
				titleEl.style.color = ''
				if (iconEl) iconEl.style.color = ''
				if (tabEl) {
					tabEl.classList.remove('file-color-tab')
					tabEl.style.removeProperty('--file-color-color')
				}
			}
		})
	}

	// Strip all plugin styling (used on unload).
	clearAll(): void {
		const explorers = this.plugin.app.workspace.getLeavesOfType(
			'file-explorer'
		) as FileExplorerLeaf[]
		explorers.forEach((explorer) => {
			const fileItems = explorer.view?.fileItems
			if (!fileItems) return
			Object.values(fileItems).forEach((item) => {
				item.el.classList.value = item.el.classList.value
					.split(' ')
					.filter((cls) => cls && !cls.startsWith('file-color'))
					.join(' ')
				item.el.style.removeProperty('--file-color-color')
			})
		})

		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			const tabLeaf = leaf as TabHeaderLeaf
			if (tabLeaf.tabHeaderInnerTitleEl) tabLeaf.tabHeaderInnerTitleEl.style.color = ''
			if (tabLeaf.tabHeaderInnerIconEl) tabLeaf.tabHeaderInnerIconEl.style.color = ''
			if (tabLeaf.tabHeaderEl) {
				tabLeaf.tabHeaderEl.classList.remove('file-color-tab')
				tabLeaf.tabHeaderEl.style.removeProperty('--file-color-color')
			}
		})
	}

	// Helper used by the modal/settings to know if a value matches a path.
	pathHasColor(path: string, value: string): boolean {
		const current = this.getColorForPath(path)
		return !!current && normalizeHex(current) === normalizeHex(value)
	}
}
