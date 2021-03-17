import { registerPartial } from 'handlebars';
import { Dir } from 'fs';
import { opendir, readFile } from 'fs/promises';
import { resolve, parse } from 'path';
import { escapeHtml } from './helpers';

/**
 * Registers each HTML file in a directory as Handlebars partial
 */
export async function registerPartials(directoryPath: string, enableHmr: boolean): Promise<void> {
  let dir: Dir;

  try {
    dir = await opendir(directoryPath);
  } catch (e) {
    // No-op if the directory does not exist
    return;
  }

  for await (const entry of dir) {
    if (entry.isFile) {
      const fullPath = resolve(directoryPath, entry.name);
      const partialName = parse(entry.name).name;
      const content = await readFile(fullPath);

      // Only inject the partial markers if in dev mode
      const partialInjectString = enableHmr
        ? `<template data-vite-handlebars-partial-marker="start"
            data-vite-handlebars-partial-name="${escapeHtml(partialName)}"></template>
            ${content.toString()}
            <template data-vite-handlebars-partial-marker="end"
            data-vite-handlebars-partial-name="${escapeHtml(partialName)}"></template>`
        : content.toString();

      registerPartial(partialName, partialInjectString);
    }
  }
}
