import { normalizePath } from 'obsidian'
import type FileColorPickerPlugin from './main'
import { generateId, normalizeHex } from './settings'

// The original "File Color" plugin by ecustic.
const SOURCE_PLUGIN_ID = 'obsidian-file-color'

// Shape of the original plugin's data.json. Note that its fileColors store the
// palette *id* in `color`, not a hex value.
interface SourceData {
	cascadeColors?: boolean
	colorBackground?: boolean
	palette?: Array<{ id: string; name: string; value: string }>
	fileColors?: Array<{ path: string; color: string }>
}

export interface SourceStatus {
	found: boolean
	paletteCount: number
	fileColorCount: number
}

export interface ImportSummary {
	found: boolean
	paletteAdded: number
	fileColorsImported: number
	skipped: number
}

function sourceDataPath(plugin: FileColorPickerPlugin): string {
	return normalizePath(
		`${plugin.app.vault.configDir}/plugins/${SOURCE_PLUGIN_ID}/data.json`
	)
}

// Read and parse the original plugin's data from the current vault.
async function readSourceData(plugin: FileColorPickerPlugin): Promise<SourceData | null> {
	const path = sourceDataPath(plugin)
	const adapter = plugin.app.vault.adapter
	if (!(await adapter.exists(path))) return null
	try {
		return JSON.parse(await adapter.read(path)) as SourceData
	} catch {
		return null
	}
}

// Report whether the original plugin's data exists and how big it is.
export async function getSourceStatus(plugin: FileColorPickerPlugin): Promise<SourceStatus> {
	const data = await readSourceData(plugin)
	if (!data) return { found: false, paletteCount: 0, fileColorCount: 0 }
	return {
		found: true,
		paletteCount: data.palette?.length ?? 0,
		fileColorCount: data.fileColors?.length ?? 0,
	}
}

// Merge the original plugin's palette and assignments into our settings.
export async function importFromFileColor(
	plugin: FileColorPickerPlugin,
	opts: { importDisplayOptions: boolean }
): Promise<ImportSummary> {
	const data = await readSourceData(plugin)
	if (!data) return { found: false, paletteAdded: 0, fileColorsImported: 0, skipped: 0 }

	const settings = plugin.settings

	// Resolve the original palette id -> hex value.
	const idToValue = new Map<string, string>()
	for (const c of data.palette ?? []) idToValue.set(c.id, c.value)

	// Merge palette colors, de-duplicating by hex value.
	let paletteAdded = 0
	for (const c of data.palette ?? []) {
		const exists = settings.palette.some(
			(p) => normalizeHex(p.value) === normalizeHex(c.value)
		)
		if (!exists) {
			settings.palette.push({ id: generateId(), name: c.name || '', value: c.value })
			paletteAdded++
		}
	}

	// Map fileColors (id -> hex) into our path/value model.
	let fileColorsImported = 0
	let skipped = 0
	for (const fc of data.fileColors ?? []) {
		const value = idToValue.get(fc.color)
		if (!value) {
			skipped++
			continue
		}
		const idx = settings.fileColors.findIndex((x) => x.path === fc.path)
		if (idx >= 0) settings.fileColors[idx].value = value
		else settings.fileColors.push({ path: fc.path, value })
		fileColorsImported++
	}

	if (opts.importDisplayOptions) {
		if (typeof data.cascadeColors === 'boolean') settings.cascadeColors = data.cascadeColors
		if (typeof data.colorBackground === 'boolean')
			settings.colorBackground = data.colorBackground
	}

	// Keep the palette within its cap.
	if (settings.palette.length > settings.maxPaletteColors) {
		settings.palette = settings.palette.slice(
			settings.palette.length - settings.maxPaletteColors
		)
	}

	await plugin.saveSettings()
	plugin.applier.applyAll()

	return { found: true, paletteAdded, fileColorsImported, skipped }
}
