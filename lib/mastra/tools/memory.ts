import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getMemorySessionId } from './memory-context';

const MEMORY_BASE_ROOT = path.resolve(process.cwd(), 'runtime-memory', 'sessions');
const LINE_NUMBER_WIDTH = 6;
const MAX_LINES = 999_999;
const SESSION_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours
const CLEANUP_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes

const viewedRootBySession = new Map<string, boolean>();
let lastCleanupAt = 0;

const memoryCommandSchema = z.discriminatedUnion('command', [
  z.object({
    command: z.literal('view'),
    path: z.string(),
    view_range: z.tuple([z.number().int(), z.number().int()]).optional(),
  }),
  z.object({
    command: z.literal('create'),
    path: z.string(),
    file_text: z.string(),
  }),
  z.object({
    command: z.literal('str_replace'),
    path: z.string(),
    old_str: z.string(),
    new_str: z.string(),
  }),
  z.object({
    command: z.literal('insert'),
    path: z.string(),
    insert_line: z.number().int(),
    insert_text: z.string(),
  }),
  z.object({
    command: z.literal('delete'),
    path: z.string(),
  }),
  z.object({
    command: z.literal('rename'),
    old_path: z.string(),
    new_path: z.string(),
  }),
]);

function formatFileSize(size: number) {
  const units = ['B', 'K', 'M', 'G', 'T'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return unitIndex === 0 ? `${value}${units[unitIndex]}` : `${value.toFixed(1)}${units[unitIndex]}`;
}

async function ensureMemoryRoot() {
  await fs.mkdir(MEMORY_BASE_ROOT, { recursive: true, mode: 0o700 });
  await fs.mkdir(getScopedMemoryRoot(), { recursive: true, mode: 0o700 });
  await maybePruneExpiredSessions();
}

function assertWithinMemoryRoot(memoryPath: string) {
  if (!(memoryPath === '/memories' || memoryPath.startsWith('/memories/'))) {
    throw new Error(`Path must start with /memories, got: ${memoryPath}`);
  }
}

function getScopedMemoryRoot() {
  const sessionId = getMemorySessionId();
  if (!sessionId) {
    throw new Error('Memory session is not set');
  }
  return path.resolve(MEMORY_BASE_ROOT, sessionId, 'memories');
}

export function beginMemoryTurn(sessionId: string) {
  viewedRootBySession.set(sessionId, false);
}

function assertViewedRootForSession(sessionId: string, command: string) {
  if (command === 'view') return;
  const viewed = viewedRootBySession.get(sessionId);
  if (!viewed) {
    throw new Error(
      'Memory protocol violation: call {"command":"view","path":"/memories"} before other memory commands in this turn.'
    );
  }
}

async function maybePruneExpiredSessions() {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;

  const entries = await fs.readdir(MEMORY_BASE_ROOT, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const sessionDir = path.join(MEMORY_BASE_ROOT, entry.name);
        const stats = await fs.stat(sessionDir).catch(() => null);
        if (!stats) return;
        if (now - stats.mtimeMs > SESSION_TTL_MS) {
          await fs.rm(sessionDir, { recursive: true, force: true }).catch(() => {});
          viewedRootBySession.delete(entry.name);
        }
      })
  );
}

function resolveMemoryPath(memoryPath: string) {
  assertWithinMemoryRoot(memoryPath);
  const memoryRoot = getScopedMemoryRoot();
  const relative = memoryPath.slice('/memories'.length).replace(/^\/+/, '');
  const resolved = path.resolve(memoryRoot, relative);
  if (resolved !== memoryRoot && !resolved.startsWith(`${memoryRoot}${path.sep}`)) {
    throw new Error(`Path ${memoryPath} would escape /memories directory`);
  }
  return resolved;
}

async function readPathStats(memoryPath: string) {
  const fullPath = resolveMemoryPath(memoryPath);
  const stats = await fs.stat(fullPath).catch(() => null);
  if (!stats) {
    throw new Error(`The path ${memoryPath} does not exist. Please provide a valid path.`);
  }
  return { fullPath, stats };
}

async function atomicWriteFile(fullPath: string, content: string) {
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const tempPath = path.join(dir, `.tmp-${process.pid}-${randomUUID()}`);
  let fileHandle: fs.FileHandle | undefined;
  try {
    fileHandle = await fs.open(tempPath, 'wx', 0o600);
    await fileHandle.writeFile(content, 'utf8');
    await fileHandle.sync();
    await fileHandle.close();
    fileHandle = undefined;
    await fs.rename(tempPath, fullPath);
  } catch (error) {
    if (fileHandle) {
      await fileHandle.close().catch(() => {});
    }
    await fs.unlink(tempPath).catch(() => {});
    throw error;
  }
}

function getChangedSnippet(newContent: string, newStr: string) {
  const changedIndex = newContent.indexOf(newStr);
  const changedLineIndex =
    changedIndex >= 0 ? newContent.slice(0, changedIndex).split('\n').length - 1 : 0;
  const lines = newContent.split('\n');
  const contextStart = Math.max(0, changedLineIndex - 2);
  const contextEnd = Math.min(lines.length, changedLineIndex + 3);
  const snippet = lines.slice(contextStart, contextEnd).map((line, idx) => {
    const lineNo = String(contextStart + idx + 1).padStart(LINE_NUMBER_WIDTH, ' ');
    return `${lineNo}\t${line}`;
  });
  return (
    'The memory file has been edited. Here is the snippet showing the change (with line numbers):\n' +
    snippet.join('\n')
  );
}

function renderLineNumberedContent(memoryPath: string, content: string, viewRange?: [number, number]) {
  const lines = content.split('\n');
  if (lines.length > MAX_LINES) {
    throw new Error(`File ${memoryPath} exceeds maximum line limit of 999,999 lines.`);
  }

  let start = 1;
  let end = lines.length;
  if (viewRange && viewRange.length === 2) {
    start = Math.max(1, viewRange[0]);
    end = viewRange[1] === -1 ? lines.length : Math.min(lines.length, viewRange[1]);
  }

  const selected = lines.slice(start - 1, end);
  const numbered = selected.map((line, idx) => {
    const lineNo = String(start + idx).padStart(LINE_NUMBER_WIDTH, ' ');
    return `${lineNo}\t${line}`;
  });

  return `Here's the content of ${memoryPath} with line numbers:\n${numbered.join('\n')}`;
}

async function listDirectory(memoryPath: string, fullPath: string) {
  const rows: Array<{ size: string; rel: string }> = [];

  async function walk(dir: string, relPrefix: string, depth: number) {
    if (depth > 2) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const filtered = entries
      .filter((entry) => !entry.name.startsWith('.') && entry.name !== 'node_modules')
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of filtered) {
      const entryFullPath = path.join(dir, entry.name);
      const entryRel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      const stats = await fs.stat(entryFullPath);
      rows.push({
        size: formatFileSize(stats.size),
        rel: entry.isDirectory() ? `${entryRel}/` : entryRel,
      });
      if (entry.isDirectory()) {
        await walk(entryFullPath, entryRel, depth + 1);
      }
    }
  }

  await walk(fullPath, '', 1);
  const rootStats = await fs.stat(fullPath);
  const header = `Here're the files and directories up to 2 levels deep in ${memoryPath}, excluding hidden items and node_modules:`;
  const lines = [`${formatFileSize(rootStats.size)}\t${memoryPath}`];
  lines.push(...rows.map((row) => `${row.size}\t${memoryPath}/${row.rel}`));
  return `${header}\n${lines.join('\n')}`;
}

export const memoryTool = createTool({
  id: 'memory',
  description:
    'Persistent file-based memory in /memories. Supported commands: view, create, str_replace, insert, delete, rename.',
  inputSchema: memoryCommandSchema,
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async (input) => {
    await ensureMemoryRoot();
    const sessionId = getMemorySessionId();
    if (!sessionId) {
      return {
        result: 'Memory session is not set. Please retry the request.',
      };
    }

    try {
      assertViewedRootForSession(sessionId, input.command);

      if (input.command === 'view') {
        const { fullPath, stats } = await readPathStats(input.path);
        if (stats.isDirectory()) {
          if (input.path === '/memories') {
            viewedRootBySession.set(sessionId, true);
          }
          return { result: await listDirectory(input.path, fullPath) };
        }
        if (!stats.isFile()) {
          throw new Error(`Unsupported file type for ${input.path}`);
        }
        const content = await fs.readFile(fullPath, 'utf8');
        return { result: renderLineNumberedContent(input.path, content, input.view_range) };
      }

      if (input.command === 'create') {
        const fullPath = resolveMemoryPath(input.path);
        const existing = await fs.stat(fullPath).catch(() => null);
        if (existing) {
          throw new Error(`Error: File ${input.path} already exists`);
        }
        await fs.mkdir(path.dirname(fullPath), { recursive: true, mode: 0o700 });
        await fs.writeFile(fullPath, input.file_text, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
        return { result: `File created successfully at: ${input.path}` };
      }

      if (input.command === 'str_replace') {
        const { fullPath, stats } = await readPathStats(input.path);
        if (!stats.isFile()) {
          throw new Error(`Error: The path ${input.path} does not exist. Please provide a valid path.`);
        }
        const content = await fs.readFile(fullPath, 'utf8');
        const chunks = content.split(input.old_str);
        const occurrences = chunks.length - 1;
        if (occurrences === 0) {
          return {
            result: `No replacement was performed, old_str \`${input.old_str}\` did not appear verbatim in ${input.path}.`,
          };
        }
        if (occurrences > 1) {
          const lines = content
            .split('\n')
            .map((line, idx) => (line.includes(input.old_str) ? idx + 1 : null))
            .filter((lineNo): lineNo is number => lineNo !== null);
          return {
            result: `No replacement was performed. Multiple occurrences of old_str \`${input.old_str}\` in lines: ${lines.join(', ')}. Please ensure it is unique`,
          };
        }

        const newContent = content.replace(input.old_str, input.new_str);
        await atomicWriteFile(fullPath, newContent);
        return { result: getChangedSnippet(newContent, input.new_str) };
      }

      if (input.command === 'insert') {
        const { fullPath, stats } = await readPathStats(input.path);
        if (!stats.isFile()) {
          throw new Error(`Error: The path ${input.path} does not exist`);
        }

        const content = await fs.readFile(fullPath, 'utf8');
        const lines = content.length === 0 ? [] : content.split('\n');
        if (input.insert_line < 0 || input.insert_line > lines.length) {
          return {
            result: `Error: Invalid \`insert_line\` parameter: ${input.insert_line}. It should be within the range of lines of the file: [0, ${lines.length}]`,
          };
        }

        const insertLines = input.insert_text.endsWith('\n')
          ? input.insert_text.slice(0, -1).split('\n')
          : input.insert_text.split('\n');
        const newLines = [
          ...lines.slice(0, input.insert_line),
          ...insertLines,
          ...lines.slice(input.insert_line),
        ];
        await atomicWriteFile(fullPath, newLines.join('\n'));
        return { result: `The file ${input.path} has been edited.` };
      }

      if (input.command === 'delete') {
        if (input.path === '/memories') {
          throw new Error('Cannot delete the /memories directory itself');
        }
        const fullPath = resolveMemoryPath(input.path);
        const stats = await fs.stat(fullPath).catch(() => null);
        if (!stats) {
          throw new Error(`Error: The path ${input.path} does not exist`);
        }
        if (stats.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
        return { result: `Successfully deleted ${input.path}` };
      }

      const oldFullPath = resolveMemoryPath(input.old_path);
      const newFullPath = resolveMemoryPath(input.new_path);
      const oldStats = await fs.stat(oldFullPath).catch(() => null);
      if (!oldStats) {
        throw new Error(`Error: The path ${input.old_path} does not exist`);
      }
      const newStats = await fs.stat(newFullPath).catch(() => null);
      if (newStats) {
        throw new Error(`Error: The destination ${input.new_path} already exists`);
      }
      await fs.mkdir(path.dirname(newFullPath), { recursive: true, mode: 0o700 });
      await fs.rename(oldFullPath, newFullPath);
      return { result: `Successfully renamed ${input.old_path} to ${input.new_path}` };
    } catch (error) {
      return {
        result: error instanceof Error ? error.message : 'Unknown memory tool error',
      };
    }
  },
});
