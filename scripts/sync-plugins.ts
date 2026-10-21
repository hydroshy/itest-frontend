import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetPluginsDir = path.resolve(rootDir, 'plugins');

// Default source directories to check
const candidateSourceDirs = [
  process.env.PLUGINS_SOURCE_DIR,
  path.resolve(rootDir, '../itest-plugins/plugins'),
  path.resolve(rootDir, '../itest-system/plugins'),
  path.resolve(rootDir, '../../itest-plugins/plugins'),
].filter(Boolean) as string[];

interface PluginSyncResult {
  id: string;
  sourcePath: string;
  targetPath: string;
  hasFrontend: boolean;
  status: 'synced' | 'skipped' | 'failed';
  message?: string;
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursive(src: string, dest: string) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', '.turbo', '.cache'].includes(entry.name)) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function syncExternalPlugins(): PluginSyncResult[] {
  console.log('[SyncPlugins] Starting plugin discovery...');
  ensureDir(targetPluginsDir);

  const results: PluginSyncResult[] = [];
  let sourceDirFound: string | null = null;

  for (const dir of candidateSourceDirs) {
    if (fs.existsSync(dir)) {
      sourceDirFound = dir;
      break;
    }
  }

  if (!sourceDirFound) {
    console.warn(`[SyncPlugins] No external plugins directory found. Checked:\n - ${candidateSourceDirs.join('\n - ')}`);
    console.log('[SyncPlugins] Using existing local plugins in "plugins/" directory if any.');
    return results;
  }

  console.log(`[SyncPlugins] Scanning source plugins from: ${sourceDirFound}`);
  const pluginFolders = fs.readdirSync(sourceDirFound, { withFileTypes: true });

  // Clear existing targetPluginsDir to avoid stale backend plugins
  const existingTargets = fs.readdirSync(targetPluginsDir, { withFileTypes: true });
  for (const e of existingTargets) {
    if (e.isDirectory()) {
      fs.rmSync(path.join(targetPluginsDir, e.name), { recursive: true, force: true });
    }
  }

  for (const item of pluginFolders) {
    if (!item.isDirectory()) continue;
    const pluginSource = path.join(sourceDirFound, item.name);
    const manifestCandidates = ['plugin.json', 'plugin-manifest.json', 'package.json'];
    let manifestFile: string | null = null;
    let manifestData: any = null;

    for (const c of manifestCandidates) {
      const p = path.join(pluginSource, c);
      if (fs.existsSync(p)) {
        try {
          manifestData = JSON.parse(fs.readFileSync(p, 'utf-8'));
          manifestFile = p;
          break;
        } catch {
          // ignore corrupted json here, generator will report
        }
      }
    }

    // Check for frontend source directory or explicit frontend entry in manifest
    const frontendDir = path.join(pluginSource, 'frontend');
    const hasFrontendFolder = fs.existsSync(frontendDir) && fs.statSync(frontendDir).isDirectory();
    const hasExplicitFrontend = !!manifestData?.frontend;

    if (!hasFrontendFolder && !hasExplicitFrontend) {
      // Backend-only plugin, skip syncing for frontend build
      results.push({
        id: item.name,
        sourcePath: pluginSource,
        targetPath: '',
        hasFrontend: false,
        status: 'skipped',
        message: 'No frontend/ directory found (backend-only plugin)',
      });
      continue;
    }

    const targetPluginDir = path.join(targetPluginsDir, item.name);

    try {
      if (hasFrontendFolder) {
        ensureDir(targetPluginDir);
        copyRecursive(frontendDir, path.join(targetPluginDir, 'frontend'));

        if (manifestFile) {
          const manifestContent = fs.readFileSync(manifestFile, 'utf-8');
          fs.writeFileSync(path.join(targetPluginDir, path.basename(manifestFile)), manifestContent, 'utf-8');
        }
      } else {
        copyRecursive(pluginSource, targetPluginDir);
      }

      results.push({
        id: item.name,
        sourcePath: pluginSource,
        targetPath: targetPluginDir,
        hasFrontend: true,
        status: 'synced',
      });
      console.log(`[SyncPlugins] Synced frontend plugin "${item.name}" -> ${targetPluginDir}`);
    } catch (err: any) {
      results.push({
        id: item.name,
        sourcePath: pluginSource,
        targetPath: targetPluginDir,
        hasFrontend: true,
        status: 'failed',
        message: err?.message || String(err),
      });
      console.error(`[SyncPlugins] Error syncing plugin "${item.name}":`, err);
    }
  }

  const syncedCount = results.filter((r) => r.status === 'synced').length;
  console.log(`[SyncPlugins] Sync complete. Synced: ${syncedCount}, Skipped backend-only: ${results.length - syncedCount}`);
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('sync-plugins.ts')) {
  syncExternalPlugins();
}
