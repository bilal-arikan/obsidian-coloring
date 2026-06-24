import { WorkspaceLeaf, View } from 'obsidian'

// Obsidian exposes some useful internals that are not part of the public
// typings. We declare the narrow slices we rely on here, kept in one place so
// the rest of the code stays free of inline `as any` casts.

export interface FileExplorerItem {
	el: HTMLElement
}

export interface FileExplorerView extends View {
	fileItems: Record<string, FileExplorerItem>
}

export interface FileExplorerLeaf extends WorkspaceLeaf {
	view: FileExplorerView
}

// A leaf's tab header elements (internal, but stable for years).
export interface TabHeaderLeaf extends WorkspaceLeaf {
	tabHeaderEl?: HTMLElement
	tabHeaderInnerTitleEl?: HTMLElement
	tabHeaderInnerIconEl?: HTMLElement
	view: View & { file?: { path: string } }
}
