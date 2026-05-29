// src/lib/env-tracker-types.ts

export interface CodeDependency {
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
}

export interface EnvNodeData {
  id: string; // e.g., 'env-STRIPE_SECRET_KEY'
  keyName: string; 
  totalUsages: number;
  dependencies: CodeDependency[];
}
