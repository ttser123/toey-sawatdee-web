import { Project, SyntaxKind } from "ts-morph";
import { NextResponse } from "next/server";
import { EnvNodeData } from "@/lib/env-tracker-types";
import path from "path";

export async function GET() {
  const project = new Project();
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Decide target path based on environment
  // Local (dev): Scan the actual /src folder
  // Production (Vercel/Docker): Scan the bundled /demo-workspace
  const scanTarget = isProduction 
    ? path.join(process.cwd(), "demo-workspace")
    : path.join(process.cwd(), "src");

  project.addSourceFilesAtPaths(`${scanTarget}/**/*.{ts,tsx}`); 

  // EXCLUSION LIST: Folders that should never be scanned
  const excludedFolders = ["PASSWORD", "temp", "node_modules"];

  const envMap = new Map<string, EnvNodeData>();

  project.getSourceFiles().forEach((sourceFile) => {
    const filePath = sourceFile.getFilePath();
    
    // Security Exclusion Check
    const isExcluded = excludedFolders.some(folder => 
      filePath.split(path.sep).includes(folder)
    );
    if (isExcluded) return;

    // Search for all PropertyAccessExpression (e.g., process.env.XXX)
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

    propertyAccesses.forEach((node) => {
      const expression = node.getExpression().getText();
      
      if (expression === "process.env") {
        const keyName = node.getName();
        // Display path relative to CWD for consistency
        const displayPath = path.relative(process.cwd(), filePath);
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
        envData.dependencies.push({ 
          filePath: displayPath, 
          lineNumber, 
          codeSnippet 
        });
      }
    });
  });

  const result: EnvNodeData[] = Array.from(envMap.values());
  return NextResponse.json(result);
}
