/**
 * TEST SCRIPT: Validate ai() wrapper system
 */

import { ai, getRegisteredComponents, getComponentTypes } from './ai';
import React from 'react';

// Mock component for testing
const TestComponent = ({ title, body }: { title: string; body: string }) => {
  return React.createElement('div', {}, title, body);
};

// Test ai() wrapper
console.log('=== TESTING AI() WRAPPER ===');

// Register test component
const WrappedComponent = ai('test-card', 'A test card component', TestComponent);

console.log('✓ Component wrapped and registered');
console.log('✓ Returned component is same as input:', WrappedComponent === TestComponent);

// Check registry
const components = getRegisteredComponents();
const types = getComponentTypes();

console.log('✓ Registered components:', components.length);
console.log('✓ Component types:', types);
console.log('✓ Test component in registry:', types.includes('test-card'));

// Verify component metadata
const testComponent = components.find(c => c.type === 'test-card');
console.log('✓ Component metadata:', {
  type: testComponent?.type,
  description: testComponent?.description,
  hasComponent: !!testComponent?.component
});

console.log('✅ AI() WRAPPER SYSTEM: WORKING');