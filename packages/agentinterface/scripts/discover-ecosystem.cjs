#!/usr/bin/env node
/**
 * ECOSYSTEM AUTODISCOVERY - Universal ai() component scanner
 * 
 * Scans entire ecosystem for ai() wrapped components:
 * - Current project components
 * - node_modules packages with ai() components  
 * - External registries
 * 
 * Generates unified registry for Python consumption
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract ai() calls from any TypeScript/JavaScript code
 */
function extractAiCalls(code, filepath) {
  const results = [];
  
  // Enhanced regex for ai() calls - handles multiline and various quote styles
  const aiCallRegex = /ai\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]*?)['"`]\s*,\s*(\w+)\s*\)/gs;
  
  let match;
  while ((match = aiCallRegex.exec(code)) !== null) {
    const [fullMatch, type, description, componentName] = match;
    
    results.push({
      type: type.trim(),
      description: description.trim(), 
      componentName: componentName.trim(),
      file: filepath,
      source: 'local'
    });
  }
  
  return results;
}

/**
 * Recursively find all component files in directory
 */
function findComponentFiles(dir, maxDepth = 3, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  
  const results = [];
  
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.')) {
        results.push(...findComponentFiles(fullPath, maxDepth, currentDepth + 1));
      } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.jsx'))) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
  
  return results;
}

/**
 * Scan node_modules for packages with ai() components
 */
function scanNodeModules(projectRoot) {
  console.log('🔍 Scanning node_modules for ai() compatible packages...');
  
  const nodeModulesDir = path.join(projectRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    console.log('   ❌ No node_modules found');
    return [];
  }
  
  const allComponents = [];
  const packages = fs.readdirSync(nodeModulesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'));
  
  console.log(`   📦 Scanning ${packages.length} packages...`);
  
  for (const pkg of packages.slice(0, 10)) { // Limit for performance
    const pkgPath = path.join(nodeModulesDir, pkg.name);
    const packageJsonPath = path.join(pkgPath, 'package.json');
    
    try {
      // Check if package has agentinterface config
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (packageJson.agentinterface) {
          console.log(`   🎯 Found ai-compatible package: ${pkg.name}`);
          
          // Check for existing registry
          const registryPath = path.join(pkgPath, packageJson.agentinterface.registry || 'ai-registry.json');
          if (fs.existsSync(registryPath)) {
            const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            const components = Object.entries(registry.components || {}).map(([type, data]) => ({
              type,
              description: data.description,
              componentName: data.componentName,
              file: `node_modules/${pkg.name}/${data.file}`,
              source: pkg.name
            }));
            allComponents.push(...components);
            console.log(`      ✓ Loaded ${components.length} components from registry`);
          } else {
            // Scan package components directory
            const componentDirs = packageJson.agentinterface.components || ['src/components'];
            for (const compDir of [].concat(componentDirs)) {
              const scanDir = path.join(pkgPath, compDir);
              if (fs.existsSync(scanDir)) {
                const files = findComponentFiles(scanDir, 2);
                for (const file of files.slice(0, 5)) { // Limit per package
                  const code = fs.readFileSync(file, 'utf8');
                  const components = extractAiCalls(code, `node_modules/${pkg.name}/${path.relative(pkgPath, file)}`);
                  if (components.length > 0) {
                    components.forEach(c => c.source = pkg.name);
                    allComponents.push(...components);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Skip problematic packages
    }
  }
  
  return allComponents;
}

/**
 * Scan local project components  
 */
function scanLocalComponents(projectRoot) {
  console.log('🔍 Scanning local project for ai() components...');
  
  const scanDirs = [
    path.join(projectRoot, 'src/components'),
    path.join(projectRoot, 'components'),
    path.join(projectRoot, 'lib/components'),
    path.join(projectRoot, 'packages/agentinterface/src/components')
  ];
  
  const allComponents = [];
  
  for (const scanDir of scanDirs) {
    if (fs.existsSync(scanDir)) {
      console.log(`   📁 Scanning ${path.relative(projectRoot, scanDir)}`);
      
      const files = findComponentFiles(scanDir);
      for (const file of files) {
        const code = fs.readFileSync(file, 'utf8');
        const components = extractAiCalls(code, path.relative(projectRoot, file));
        
        if (components.length > 0) {
          allComponents.push(...components);
          console.log(`      ✓ ${path.basename(file)}: ${components.length} component(s)`);
        }
      }
    }
  }
  
  return allComponents;
}

/**
 * Load external registries from config
 */
function loadExternalRegistries(projectRoot) {
  console.log('🔍 Loading external registries...');
  
  const configPath = path.join(projectRoot, 'ai.config.json');
  if (!fs.existsSync(configPath)) {
    return [];
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const externalRegistries = config.registries || [];
    
    const allComponents = [];
    
    for (const registryPath of externalRegistries) {
      const fullPath = path.resolve(projectRoot, registryPath);
      if (fs.existsSync(fullPath)) {
        const registry = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const components = Object.entries(registry.components || {}).map(([type, data]) => ({
          type,
          description: data.description,
          componentName: data.componentName,
          file: data.file,
          source: 'external'
        }));
        allComponents.push(...components);
        console.log(`   ✓ Loaded ${components.length} components from ${registryPath}`);
      }
    }
    
    return allComponents;
  } catch (error) {
    console.log(`   ❌ Error loading config: ${error.message}`);
    return [];
  }
}

/**
 * Generate unified ecosystem registry
 */
function generateEcosystemRegistry(allComponents) {
  const registry = {
    generated_at: new Date().toISOString(),
    total_components: allComponents.length,
    sources: {},
    components: {}
  };
  
  // Group by source for analytics
  for (const comp of allComponents) {
    const source = comp.source;
    if (!registry.sources[source]) {
      registry.sources[source] = [];
    }
    registry.sources[source].push(comp.type);
    
    // Add to unified components (last one wins for duplicates)
    registry.components[comp.type] = {
      description: comp.description,
      componentName: comp.componentName,
      file: comp.file,
      source: comp.source
    };
  }
  
  return registry;
}

/**
 * Main ecosystem discovery
 */
function main() {
  console.log('🚀 ECOSYSTEM AI() COMPONENT AUTODISCOVERY');
  console.log('='.repeat(50));
  
  const projectRoot = process.cwd();
  console.log(`📍 Project root: ${projectRoot}`);
  
  // Discover from all sources
  const localComponents = scanLocalComponents(projectRoot);
  const nodeModuleComponents = scanNodeModules(projectRoot);
  const externalComponents = loadExternalRegistries(projectRoot);
  
  // Combine everything
  const allComponents = [
    ...localComponents,
    ...nodeModuleComponents, 
    ...externalComponents
  ];
  
  if (allComponents.length === 0) {
    console.log('❌ No ai() components found in ecosystem!');
    process.exit(1);
  }
  
  // Generate unified registry
  const registry = generateEcosystemRegistry(allComponents);
  
  // Write ecosystem registry
  const outputPath = path.join(projectRoot, 'ai-ecosystem-registry.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  
  console.log(`\n✅ ECOSYSTEM DISCOVERY COMPLETE`);
  console.log(`📊 Total components: ${allComponents.length}`);
  console.log(`🏗️  Sources: ${Object.keys(registry.sources).join(', ')}`);
  console.log(`📁 Registry saved: ${outputPath}`);
  
  // Show source breakdown
  console.log('\n📈 Component breakdown by source:');
  for (const [source, components] of Object.entries(registry.sources)) {
    console.log(`   ${source}: ${components.length} components`);
  }
  
  // Show sample components
  const types = Object.keys(registry.components).slice(0, 8);
  console.log(`\n🎯 Sample types: ${types.join(', ')}${types.length < allComponents.length ? '...' : ''}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { 
  extractAiCalls, 
  scanLocalComponents,
  scanNodeModules,
  loadExternalRegistries,
  generateEcosystemRegistry 
};