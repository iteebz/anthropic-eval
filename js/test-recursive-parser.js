// Test the recursive parser with real examples
import { RecursiveComponentParser } from './src/parser/recursive.js';

const parser = new RecursiveComponentParser({
  maxDepth: 5,
  strictMode: false
});

// Test 1: Basic component syntax
console.log('=== Test 1: Basic Component ===');
const test1 = '{{card:{"title":"Hello"}}}';
const result1 = parser.parse(test1);
console.log('Input:', test1);
console.log('Output:', JSON.stringify(result1, null, 2));

// Test 2: Nested components
console.log('\n=== Test 2: Nested Components ===');
const test2 = '{{card:{"title":"Parent"}|nested={{button:{"text":"Click"}}}}}';
const result2 = parser.parse(test2);
console.log('Input:', test2);
console.log('Output:', JSON.stringify(result2, null, 2));

// Test 3: Complex nested with text
console.log('\n=== Test 3: Complex Nested with Text ===');
const test3 = 'Hello {{card:{"title":"Card"}|content=This is {{button:{"text":"nested"}}} content}} world!';
const result3 = parser.parse(test3);
console.log('Input:', test3);
console.log('Output:', JSON.stringify(result3, null, 2));

// Test 4: Multiple components
console.log('\n=== Test 4: Multiple Components ===');
const test4 = '{{card:{"title":"First"}}} and {{card:{"title":"Second"}}}';
const result4 = parser.parse(test4);
console.log('Input:', test4);
console.log('Output:', JSON.stringify(result4, null, 2));

// Test 5: Validation
console.log('\n=== Test 5: Validation ===');
const validation = parser.validate(result2);
console.log('Validation:', validation);

// Test 6: Serialization
console.log('\n=== Test 6: Serialization ===');
const serialized = parser.serialize(result2);
console.log('Serialized:', serialized);
console.log('Round-trip success:', test2 === serialized);