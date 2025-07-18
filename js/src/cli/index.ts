#!/usr/bin/env node

/**
 * AgentInterface CLI
 * Zero-ceremony component installation and management
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

interface ComponentTemplate {
  name: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  dependencies?: string[];
}

const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  'card-grid': {
    name: 'Card Grid',
    description: 'Responsive grid of cards with customizable layout',
    files: [
      {
        path: 'components/card-grid.tsx',
        content: `import { RendererComponentProps } from 'agentinterface';

export interface CardGridProps {
  cards: Array<{
    title: string;
    description: string;
    tags?: string[];
    links?: Array<{ url: string; label: string }>;
  }>;
  columns?: number;
  gap?: string;
}

export function CardGrid({ data, className = '' }: RendererComponentProps<CardGridProps>) {
  const { cards, columns = 3, gap = '1rem' } = data;

  return (
    <div 
      className={\`grid gap-[\${gap}] \${className}\`}
      style={{ gridTemplateColumns: \`repeat(\${columns}, 1fr)\` }}
    >
      {cards.map((card, index) => (
        <div key={index} className="aip-card">
          <h3 className="aip-text-lg aip-font-semibold aip-text-primary">{card.title}</h3>
          <p className="aip-text-secondary aip-m-sm">{card.description}</p>
          {card.tags && (
            <div className="aip-gap-sm flex flex-wrap">
              {card.tags.map((tag, i) => (
                <span key={i} className="aip-text-xs aip-bg-secondary aip-rounded px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`,
      },
    ],
  },
  'timeline': {
    name: 'Timeline',
    description: 'Vertical timeline with events and dates',
    files: [
      {
        path: 'components/timeline.tsx',
        content: `import { RendererComponentProps } from 'agentinterface';

export interface TimelineProps {
  events: Array<{
    date: string;
    title: string;
    description: string;
    type?: 'default' | 'success' | 'warning' | 'error';
  }>;
}

export function Timeline({ data, className = '' }: RendererComponentProps<TimelineProps>) {
  const { events } = data;

  return (
    <div className={\`relative \${className}\`}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 aip-bg-secondary"></div>
      {events.map((event, index) => (
        <div key={index} className="relative flex items-start aip-m-lg">
          <div className="absolute left-0 w-8 h-8 aip-bg-primary aip-rounded-full flex items-center justify-center">
            <div className="w-3 h-3 aip-bg-primary aip-rounded-full"></div>
          </div>
          <div className="ml-12">
            <div className="aip-text-sm aip-text-secondary">{event.date}</div>
            <h4 className="aip-text-lg aip-font-semibold aip-text-primary">{event.title}</h4>
            <p className="aip-text-secondary">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}`,
      },
    ],
  },
};

function showHelp() {
  console.log(`
🤖 AgentInterface CLI - Zero-ceremony component installation

Usage:
  npx agentinterface add <component>    Install a component
  npx agentinterface list               List available components
  npx agentinterface help               Show this help

Examples:
  npx agentinterface add card-grid      Install card grid component
  npx agentinterface add timeline       Install timeline component

Available components:
${Object.keys(COMPONENT_TEMPLATES).map(name => `  - ${name}: ${COMPONENT_TEMPLATES[name].description}`).join('\n')}
`);
}

function listComponents() {
  console.log('\n🎨 Available AgentInterface Components:\n');
  Object.entries(COMPONENT_TEMPLATES).forEach(([key, template]) => {
    console.log(`  ${key.padEnd(15)} ${template.description}`);
  });
  console.log('\nUse: npx agentinterface add <component-name>\n');
}

function addComponent(componentName: string) {
  const template = COMPONENT_TEMPLATES[componentName];
  if (!template) {
    console.error(`❌ Component "${componentName}" not found.`);
    console.log('Available components:', Object.keys(COMPONENT_TEMPLATES).join(', '));
    process.exit(1);
  }

  console.log(`\n🚀 Installing ${template.name}...`);

  // Create files
  template.files.forEach(file => {
    const fullPath = join(process.cwd(), file.path);
    const dir = dirname(fullPath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(fullPath, file.content);
    console.log(`✅ Created ${file.path}`);
  });

  // Update component registry if it exists
  const registryPath = join(process.cwd(), 'components', 'registry.ts');
  if (existsSync(registryPath)) {
    let registryContent = readFileSync(registryPath, 'utf-8');
    
    // Add import
    const importLine = `import { ${template.name.replace(/\s+/g, '')} } from './${componentName}';`;
    if (!registryContent.includes(importLine)) {
      registryContent = importLine + '\n' + registryContent;
    }
    
    // Add to registry object
    const exportMatch = registryContent.match(/export\s+const\s+COMPONENT_REGISTRY\s*=\s*{([^}]*)}/);
    if (exportMatch) {
      const registryKey = `'${componentName}': ${template.name.replace(/\s+/g, '')},`;
      if (!registryContent.includes(registryKey)) {
        registryContent = registryContent.replace(
          exportMatch[0],
          exportMatch[0].replace('}', `  ${registryKey}\n}`)
        );
      }
    }
    
    writeFileSync(registryPath, registryContent);
    console.log(`✅ Updated component registry`);
  }

  console.log(`\n🎉 Successfully installed ${template.name}!`);
  console.log(`\nUsage in your code:`);
  console.log(`import { ${template.name.replace(/\s+/g, '')} } from './components/${componentName}';`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const componentName = args[1];

  switch (command) {
    case 'add':
      if (!componentName) {
        console.error('❌ Please specify a component name');
        showHelp();
        process.exit(1);
      }
      addComponent(componentName);
      break;
    case 'list':
      listComponents();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error('❌ Unknown command');
      showHelp();
      process.exit(1);
  }
}

main();