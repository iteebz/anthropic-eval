#!/usr/bin/env node
/**
 * AUTODISCOVERY - Component scanner per ARCHITECTURE.md spec
 * 
 * Scans TypeScript files for component metadata exports
 * Generates ai.json registry for cross-language consumption
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract metadata via regex - SAFER THAN EVAL, SIMPLER THAN AST
 */
function extractMetadata(code, filepath) {
  // Match: export const metadata = { ... };
  const metadataRegex = /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/;
  const match = code.match(metadataRegex);
  
  if (!match) return null;
  
  try {
    // Convert JS object literal to JSON (safe for simple objects)
    let objectLiteral = match[1];
    
    // Basic JS to JSON conversion
    objectLiteral = objectLiteral
      .replace(/(\w+):/g, '"$1":')        // Quote unquoted keys
      .replace(/'/g, '"')                 // Single to double quotes
      .replace(/,(\s*[}\]])/g, '$1');     // Remove trailing commas
    
    const metadata = JSON.parse(objectLiteral);
    
    return {
      type: metadata.type,
      description: metadata.description,
      schema: metadata.schema,
      category: metadata.category || 'general',
      file: path.relative(process.cwd(), filepath)
    };
  } catch (error) {
    console.warn(`⚠️  Failed to parse metadata in ${filepath}: ${error.message}`);
    return null;
  }
}

/**
 * Find all .tsx files in directory
 */
function findTsxFiles(dir, maxDepth = 3, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  
  const results = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.includes('node_modules')) {
        results.push(...findTsxFiles(fullPath, maxDepth, currentDepth + 1));
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
  
  return results;
}

/**
 * Scan core AgentInterface components
 */
function scanCoreComponents() {
  console.log('🔍 Scanning core AgentInterface components...');
  
  const coreDir = path.join(__dirname, '../src/ai');
  const files = findTsxFiles(coreDir, 1); // Only direct files
  
  const components = [];
  
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const metadata = extractMetadata(code, file);
    
    if (metadata) {
      components.push({ ...metadata, source: 'agentinterface' });
      console.log(`   ✓ ${metadata.type}: ${metadata.description}`);
    }
  }
  
  return components;
}

/**
 * Scan current project for AIP components
 */
function scanCurrentProjectComponents() {
  console.log('🎯 Scanning current project for AIP components...');
  
  const results = [];
  const cwd = process.cwd();
  
  // Common component locations in projects
  const possiblePaths = [
    'src/components/ai',
    'components/ai', 
    'web/src/components/ai',
    'app/components/ai'
  ];
  
  for (const relativePath of possiblePaths) {
    const fullPath = path.join(cwd, relativePath);
    if (fs.existsSync(fullPath)) {
      console.log(`   📁 Found components at: ${relativePath}`);
      const files = findTsxFiles(fullPath, 2);
      const projectName = getProjectName(cwd);
      results.push(...scanFiles(files, projectName));
    }
  }
  
  return results;
}

/**
 * Scan ecosystem packages for AIP components  
 */
function scanEcosystemComponents() {
  console.log('🌍 Scanning ecosystem for published AIP components...');
  
  const results = [];
  const cwd = process.cwd();
  
  // Scan node_modules for published AIP packages
  const scanDirs = [
    'node_modules/*/src/components/ai',
    'node_modules/@*/*/src/components/ai',
  ];
  
  for (const scanPattern of scanDirs) {
    const fullPattern = path.resolve(cwd, scanPattern);
    const baseDir = path.dirname(fullPattern);
    
    if (scanPattern.includes('*')) {
      // Handle glob patterns for node_modules
      const parentDir = path.dirname(baseDir);
      if (fs.existsSync(parentDir)) {
        try {
          const packages = fs.readdirSync(parentDir, { withFileTypes: true })
            .filter(d => d.isDirectory() && !d.name.startsWith('.'))
            .slice(0, 10); // Limit for performance
            
          for (const pkg of packages) {
            const componentDir = path.join(parentDir, pkg.name, 'src/components/ai');
            if (fs.existsSync(componentDir)) {
              const files = findTsxFiles(componentDir, 2);
              results.push(...scanFiles(files, pkg.name));
            }
          }
        } catch (error) {
          // Skip inaccessible node_modules
        }
      }
    } else {
      // Direct path scanning
      if (fs.existsSync(fullPattern)) {
        console.log(`   📁 Found ecosystem path: ${fullPattern}`);
        const files = findTsxFiles(fullPattern, 2);
        const packageName = path.basename(path.dirname(path.dirname(path.dirname(fullPattern))));
        results.push(...scanFiles(files, packageName));
      } else {
        console.log(`   ❌ Path not found: ${fullPattern}`);
      }
    }
  }
  
  return results;
}

/**
 * Get project name from package.json or directory
 */
function getProjectName(cwd) {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.name || path.basename(cwd);
    }
  } catch (error) {
    // Fall back to directory name
  }
  return path.basename(cwd);
}

/**
 * Detect if we're running from AgentInterface itself
 */
function isAgentInterfaceProject(cwd) {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.name === 'agentinterface';
    } catch (error) {
      return false;
    }
  }
  return false;
}

/**
 * Scan files and extract metadata
 */
function scanFiles(files, packageName) {
  const components = [];
  
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const metadata = extractMetadata(code, file);
    
    if (metadata) {
      components.push({ ...metadata, source: packageName });
      console.log(`   ✓ [${packageName}] ${metadata.type}: ${metadata.description}`);
    }
  }
  
  return components;
}

/**
 * Generate ai.json registry
 */
function generateRegistry(allComponents) {
  const registry = {
    generated_at: new Date().toISOString(),
    version: "1.0.0",
    total_components: allComponents.length,
    components: {},
    sources: {}
  };
  
  // Group components by source for analytics
  const sourceGroups = {};
  
  for (const comp of allComponents) {
    // Add to components registry (last wins for duplicates)
    registry.components[comp.type] = {
      description: comp.description,
      schema: comp.schema,
      category: comp.category,
      file: comp.file,
      source: comp.source
    };
    
    // Track sources
    if (!sourceGroups[comp.source]) {
      sourceGroups[comp.source] = [];
    }
    sourceGroups[comp.source].push(comp.type);
  }
  
  registry.sources = sourceGroups;
  
  return registry;
}

/**
 * Main autodiscovery process
 */
function main() {
  console.log('🚀 UNIVERSAL AIP COMPONENT AUTODISCOVERY');
  console.log('='.repeat(50));
  
  const cwd = process.cwd();
  const isAgentInterface = isAgentInterfaceProject(cwd);
  
  let allComponents = [];
  
  if (isAgentInterface) {
    // Running from AgentInterface - only scan core components
    console.log('📍 Detected AgentInterface project');
    const coreComponents = scanCoreComponents();
    allComponents = [...coreComponents];
  } else {
    // Running from consuming project - scan ecosystem + current project
    console.log(`📍 Detected project: ${getProjectName(cwd)}`);
    
    // Try to find AgentInterface components in node_modules
    const agentInterfacePath = path.join(cwd, 'node_modules/agentinterface/src/ai');
    let coreComponents = [];
    
    if (fs.existsSync(agentInterfacePath)) {
      console.log('🔍 Scanning AgentInterface base components...');
      const files = findTsxFiles(agentInterfacePath, 1);
      coreComponents = scanFiles(files, 'agentinterface');
    }
    
    // Scan current project components
    const projectComponents = scanCurrentProjectComponents();
    
    // Scan other ecosystem packages
    const ecosystemComponents = scanEcosystemComponents();
    
    allComponents = [...coreComponents, ...projectComponents, ...ecosystemComponents];
  }
  
  if (allComponents.length === 0) {
    console.log('❌ No components found with metadata exports!');
    console.log('💡 Ensure components export metadata = { type, description, schema, category }');
    process.exit(1);
  }
  
  // Generate registry
  const registry = generateRegistry(allComponents);
  
  // Write registry to ai.json
  const outputPath = path.join(cwd, 'ai.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  
  console.log('\n✅ AUTODISCOVERY COMPLETE');
  console.log(`📊 Total components: ${allComponents.length}`);
  console.log(`🎯 Sources: ${Object.keys(registry.sources).join(', ')}`);
  console.log(`📁 Registry: ${outputPath}`);
  
  // Show component types
  const types = Object.keys(registry.components).sort();
  console.log(`🔧 Component types: ${types.join(', ')}`);
  
  // Show source breakdown
  console.log('\n📈 Component breakdown:');
  for (const [source, components] of Object.entries(registry.sources)) {
    console.log(`   ${source}: ${components.length} components`);
  }
  
  console.log('\n🎯 Ready for ai.protocol() and rendering!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  extractMetadata,
  scanCoreComponents, 
  scanEcosystemComponents,
  generateRegistry,
  main
};