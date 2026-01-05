#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const uiDir = path.join(projectRoot, "components", "ui");

const ignoreDirs = new Set([
	".git",
	".next",
	"node_modules",
	"dist",
	"build",
	"coverage",
	".turbo",
	".vercel",
	".husky",
	".vscode",
	"public",
]);

const allowedExtensions = new Set([
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".cjs",
	".mdx",
]);

async function getUiComponents() {
	const entries = await fs.readdir(uiDir, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
		.map((entry) => ({
			name: path.parse(entry.name).name,
			absolutePath: path.join(uiDir, entry.name),
		}));
}

async function collectFiles(dir: string): Promise<string[]> {
	const queue: string[] = [dir];
	const files: string[] = [];

	while (queue.length) {
		const current = queue.pop();
		if (!current) continue;
		const entries = await fs.readdir(current, { withFileTypes: true });

		for (const entry of entries) {
			if (ignoreDirs.has(entry.name)) continue;
			const fullPath = path.join(current, entry.name);

			if (entry.isDirectory()) {
				queue.push(fullPath);
				continue;
			}

			const ext = path.extname(entry.name);
			if (allowedExtensions.has(ext)) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

function extractImportPaths(content: string): string[] {
	const paths: string[] = [];
	const importRegex =
		/from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
	for (const match of content.matchAll(importRegex)) {
		const importPath = match[1] ?? match[2];
		if (importPath) paths.push(importPath);
	}
	return paths;
}

function matchesComponent(importPath: string, componentName: string): boolean {
	const normalized = importPath.replace(/\\/g, "/");
	if (!normalized.includes("/ui/")) return false;
	const lastSegment = normalized.split("/").pop() ?? "";
	const baseName = lastSegment.replace(/\.[^.]+$/, "");
	return baseName === componentName;
}

async function findUnusedUiComponents() {
	try {
		await fs.access(uiDir);
	} catch {
		console.error(`UI components directory not found at ${uiDir}`);
		process.exit(1);
	}

	const uiComponents = await getUiComponents();
	if (!uiComponents.length) {
		console.log("No UI components found.");
		return;
	}

	const usageCount = new Map(uiComponents.map((c) => [c.name, 0]));
	const filesToScan = await collectFiles(projectRoot);

	for (const file of filesToScan) {
		const content = await fs.readFile(file, "utf8");
		const importPaths = extractImportPaths(content);

		for (const importPath of importPaths) {
			for (const component of uiComponents) {
				if (matchesComponent(importPath, component.name)) {
					usageCount.set(
						component.name,
						(usageCount.get(component.name) ?? 0) + 1,
					);
				}
			}
		}
	}

	const unused = uiComponents.filter(
		(component) => (usageCount.get(component.name) ?? 0) === 0,
	);

	console.log(
		`Scanned ${uiComponents.length} UI components across ${filesToScan.length} files.`,
	);

	if (!unused.length) {
		console.log("All UI components are in use.");
		return;
	}

	console.log("Unused UI components:");
	for (const component of unused) {
		console.log(`- ${path.relative(projectRoot, component.absolutePath)}`);
	}

	process.exitCode = 1;
}

findUnusedUiComponents();
