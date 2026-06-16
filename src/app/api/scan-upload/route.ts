import { NextResponse } from "next/server";
import { EnvNodeData } from "@/lib/env-tracker-types";
import path from "path";
import fs from "fs";

// Force dynamic to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

// Global In-Memory Cache to prevent redundant parsing
let GLOBAL_WORKSPACE_ENV_CACHE: EnvNodeData[] | null = null;

function getAllFiles(dirPath: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dirPath)) return files;
  
  function recurse(currentDir: string) {
    const list = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of list) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        recurse(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  recurse(dirPath);
  return files;
}

function scanFileContent(filePath: string, content: string, envMap: Map<string, EnvNodeData>, relativeToCwd: boolean = true) {
  const lines = content.split(/\r?\n/);
  const displayPath = relativeToCwd ? path.relative(process.cwd(), filePath).replace(/\\/g, '/') : filePath;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Ignore lines that are comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return;
    }

    const envRegex = /process\.env\.([a-zA-Z_][a-zA-Z0-9_]*)|\bprocess\.env\[['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\]/g;
    let match;
    while ((match = envRegex.exec(line)) !== null) {
      const keyName = match[1] || match[2];
      if (!keyName) continue;

      const lineNumber = index + 1;
      const codeSnippet = trimmed;

      if (!envMap.has(keyName)) {
        envMap.set(keyName, {
          id: `env-${keyName}`,
          keyName,
          totalUsages: 0,
          dependencies: []
        });
      }

      const envData = envMap.get(keyName)!;
      envData.totalUsages += 1;
      envData.dependencies.push({ filePath: displayPath, lineNumber, codeSnippet });
    }
  });
}

// GET: Isomorphic Hydration (Server scans demo-workspace for default telemetry)
export async function GET() {
  try {
    // FAST PATH: Return cached payload instantly if available
    if (GLOBAL_WORKSPACE_ENV_CACHE !== null) {
      console.log("=> [Server Cache] HIT: SERVING_WORKSPACE_TELEMETRY_INSTANTLY");
      return NextResponse.json(GLOBAL_WORKSPACE_ENV_CACHE);
    }

    console.log("=> [Server Cache] MISS: INITIALIZING_FIRST_TIME_AST_SCAN");

    const envMap = new Map<string, EnvNodeData>();
    const demoDir = path.join(process.cwd(), 'demo-workspace');
    const files = getAllFiles(demoDir);

    files.forEach((filePath) => {
      // 🛡️ Cross-platform blacklisting shield
      const isExhausted = /node_modules[\\/]|\.next[\\/]|\.git[\\/]/.test(filePath);
      if (isExhausted) return;

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        scanFileContent(filePath, content, envMap, true);
      } catch (err) {
        console.error(`Failed to read/scan file ${filePath}:`, err);
      }
    });

    GLOBAL_WORKSPACE_ENV_CACHE = Array.from(envMap.values());
    return NextResponse.json(GLOBAL_WORKSPACE_ENV_CACHE);

  } catch (error: any) {
    console.error('Initial Environment Scan Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Drag-and-Drop Virtual File System Scan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { files } = body;

    const envMap = new Map<string, EnvNodeData>();

    Object.entries(files).forEach(([filePath, fileContent]) => {
      const isExhausted = /node_modules[\\/]|\.next[\\/]|\.git[\\/]/.test(filePath);
      if (!isExhausted) {
        const cleanPath = filePath.replace(/^\//, '');
        scanFileContent(cleanPath, fileContent as string, envMap, false);
      }
    });

    const result: EnvNodeData[] = Array.from(envMap.values());
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Environment Scan Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
