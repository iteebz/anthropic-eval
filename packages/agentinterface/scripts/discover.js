#!/usr/bin/env node
/**
 * AUTODISCOVERY: Extract ai() component registrations from React files
 * 
 * Scans all .tsx files for ai('type', 'description', Component) patterns
 * Outputs component registry for Python consumption
 */

const fs = require('fs');
const path = require('path');

// Simple glob replacement using node built-ins
function findFiles(dir, pattern) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (file.isFile() && file.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Extract ai() calls from TypeScript code
 * Looks for: ai('component-type', 'description', ComponentFunction)
 */
function extractAiCalls(code, filepath) {
  const results = [];
  
  // Regex to match ai() calls with 3 parameters
  const aiCallRegex = /ai\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)\s*\)/g;
  
  let match;
  while ((match = aiCallRegex.exec(code)) !== null) {
    const [fullMatch, type, description, componentName] = match;
    
    results.push({
      type: type.trim(),
      description: description.trim(), 
      componentName: componentName.trim(),
      file: path.relative(process.cwd(), filepath),
      pattern: fullMatch.trim()
    });
  }
  
  return results;
}

/**
 * Scan directory for React component files
 */
function scanComponents(srcDir) {
  console.log(`🔍 Scanning ${srcDir} for ai() component registrations...`);
  
  // Find all .tsx files in components directory  
  const files = findFiles(srcDir, '.tsx');
  
  const allComponents = [];
  
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const components = extractAiCalls(code, file);
    
    if (components.length > 0) {
      console.log(`📄 ${path.basename(file)}: Found ${components.length} component(s)`);
      
      for (const comp of components) {
        console.log(`   ✓ ${comp.type}: "${comp.description}"`);
      }
      
      allComponents.push(...components);
    }
  }
  
  return allComponents;
}

/**
 * Generate component registry JSON
 */
function generateRegistry(components) {
  const registry = {
    generated_at: new Date().toISOString(),
    total_components: components.length,
    components: {}
  };
  
  // Group by type (should be unique)
  for (const comp of components) {
    registry.components[comp.type] = {
      description: comp.description,
      componentName: comp.componentName,
      file: comp.file,
      pattern: comp.pattern
    };
  }
  
  return registry;
}

/**
 * Main extraction process
 */
function main() {
  console.log('🚀 AGENTINTERFACE AUTODISCOVERY');
  console.log('='.repeat(50));
  
  // Scan React components
  const srcDir = path.join(__dirname, '../src/components');
  const components = scanComponents(srcDir);
  
  if (components.length === 0) {
    console.log('❌ No ai() component registrations found!');
    process.exit(1);
  }
  
  // Generate registry
  const registry = generateRegistry(components);
  
  // Write to output file
  const outputPath = path.join(__dirname, '../src/ai.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  
  console.log(`\n✅ AUTODISCOVERY COMPLETE`);
  console.log(`📊 Found ${components.length} components`);
  console.log(`📁 Registry saved: ${outputPath}`);
  
  // Show component types for verification
  const types = components.map(c => c.type).sort();
  console.log(`🎯 Component types: ${types.join(', ')}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractAiCalls, scanComponents, generateRegistry };