import { Project, SyntaxKind } from "ts-morph";
import { NextResponse } from "next/server";
import { EnvNodeData } from "@/lib/env-tracker-types";
import path from "path";

// 🛠️ CONFIG: Enterprise-grade speed optimization to prevent Node.js Event Loop blocking
const AST_SPEED_CONFIG = {
  skipLoadingLibFiles: true, // Crucial: skip loading massive ts standard libs
  skipAddingFilesFromTsConfig: true,
  compilerOptions: {
    skipLibCheck: true,
    noResolve: true // Prevent crawling node_modules
  }
};

// 🛠️ THE MASTERPIECE CACHE: Global In-Memory Cache to prevent redundant synchronous AST parsing
let GLOBAL_WORKSPACE_ENV_CACHE: EnvNodeData[] | null = null;

// 🌟 GET: Isomorphic Hydration (Server scans itself for default telemetry)
export async function GET() {
  try {
    // 1. 🔥 FAST PATH: Return cached payload instantly if available (0ms Event Loop block)
    if (GLOBAL_WORKSPACE_ENV_CACHE !== null) {
      console.log("=> [Server Cache] HIT: SERVING_WORKSPACE_TELEMETRY_INSTANTLY");
      return NextResponse.json(GLOBAL_WORKSPACE_ENV_CACHE);
    }

    console.log("=> [Server Cache] MISS: INITIALIZING_FIRST_TIME_AST_SCAN");

    // 🛠️ HIGH-PERFORMANCE INSTANTIATION
    const project = new Project(AST_SPEED_CONFIG);
    const envMap = new Map<string, EnvNodeData>();

    const isProduction = process.env.NODE_ENV === 'production';
    // Match the exact scope of the client-side upload: scan root level for .ts, .tsx, .js
    const targetPath = isProduction 
      ? path.join(process.cwd(), 'demo-workspace/**/*.{ts,tsx,js}')
      : path.join(process.cwd(), '**/*.{ts,tsx,js}');

    project.addSourceFilesAtPaths(targetPath);

    // Common traversal logic (Synchronous & CPU Intensive)
    project.getSourceFiles().forEach((sourceFile) => {
      const filePath = sourceFile.getFilePath();
      
      // 🛡️ Cross-platform blacklisting shield
      const isExhausted = /node_modules[\\/]|PASSWORD[\\/]|\.next[\\/]|\.git[\\/]/.test(filePath);
      if (isExhausted) return;

      const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

      propertyAccesses.forEach((node) => {
        const expression = node.getExpression().getText();
        
        if (expression === "process.env") {
          const keyName = node.getName();
          // Normalize display path
          const displayPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/'); 
          const lineNumber = sourceFile.getLineAndColumnAtPos(node.getStart()).line;
          
          const codeSnippet = node.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)?.getText() 
                           || node.getParent()?.getText() 
                           || node.getText();

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
    });

    // 2. 🔥 CACHE MISS RESOLVED: Store the heavy computation result in RAM permanently
    GLOBAL_WORKSPACE_ENV_CACHE = Array.from(envMap.values());
    
    return NextResponse.json(GLOBAL_WORKSPACE_ENV_CACHE);

  } catch (error: any) {
    console.error('Initial AST Scan Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🌟 POST: No-Code Drag-and-Drop (In-Memory Virtual File System)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { files } = body; 

    // 🛠️ IN-MEMORY INSTANTIATION + SPEED CONFIG
    const project = new Project({ 
      ...AST_SPEED_CONFIG,
      useInMemoryFileSystem: true 
    });
    
    const envMap = new Map<string, EnvNodeData>();

    // Inject all files into the RAM-based Virtual System
    Object.entries(files).forEach(([filePath, fileContent]) => {
      // 🛡️ Defensive Programming: Double check to prevent RAM explosion
      const isExhausted = /node_modules[\\/]|PASSWORD[\\/]|\.next[\\/]|\.git[\\/]/.test(filePath);
      if (!isExhausted) {
        project.createSourceFile(filePath, fileContent as string);
      }
    });

    // Traverse and analyze exactly as before, but operating at light-speed in memory
    project.getSourceFiles().forEach((sourceFile) => {
      const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

      propertyAccesses.forEach((node) => {
        const expression = node.getExpression().getText();
        
        if (expression === "process.env") {
          const keyName = node.getName();
          // Virtual paths have a leading slash, clean it for UI consistency
          const filePath = sourceFile.getFilePath().replace(/^\//, ''); 
          const lineNumber = sourceFile.getLineAndColumnAtPos(node.getStart()).line;
          
          const codeSnippet = node.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)?.getText() 
                           || node.getParent()?.getText() 
                           || node.getText();

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
          envData.dependencies.push({ filePath, lineNumber, codeSnippet });
        }
      });
    });

    const result: EnvNodeData[] = Array.from(envMap.values());
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('In-Memory AST Scan Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
