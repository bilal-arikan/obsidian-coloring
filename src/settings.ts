// A color saved in the reusable palette.
export interface SavedColor {
	id: string
	name: string
	value: string // hex, e.g. "#4caf50"
}

// A color assigned to a specific file or folder path.
export interface FileColor {
	path: string
	value: string // hex value applied directly
}

export interface FileColorPickerSettings {
	// Reusable palette that grows as the user picks new colors.
	palette: SavedColor[]
	// Per-path color assignments.
	fileColors: FileColor[]
	// Color the background instead of the text in the file explorer.
	colorBackground: boolean
	// Cascade a folder color down to its children.
	cascadeColors: boolean
	// Tint the tab header of an opened colored file.
	colorTabHeader: boolean
	// Cap on how many colors the palette keeps.
	maxPaletteColors: number
}

export const DEFAULT_SETTINGS: FileColorPickerSettings = {
	palette: [],
	fileColors: [],
	colorBackground: false,
	cascadeColors: false,
	colorTabHeader: true,
	maxPaletteColors: 36,
}

// Small unique id generator (no external dependency).
export function generateId(): string {
	return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Normalize a hex color for comparison.
export function normalizeHex(value: string): string {
	return value.trim().toLowerCase()
}
