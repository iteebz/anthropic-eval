# Agent Training Guide

## Component Selection for AI Agents

This guide helps AI agents understand when and how to use AgentInterface components effectively.

## Core Component Decision Matrix

### When to Use Timeline
**Use for**: Chronological data, historical sequences, process flows, progress tracking
**Ideal when**: 
- Data has dates or temporal order
- Showing progression or development over time
- User asks about history, timeline, or sequence of events

**Avoid when**: 
- Data is not time-based
- Presenting static lists or categories
- Single point-in-time information

**Example triggers**: "timeline", "history", "chronological", "events", "progression", "development over time"

### When to Use Cards
**Use for**: Multiple distinct items, comparison scenarios, project showcases, option menus
**Ideal when**:
- Presenting 2+ separate items that can be compared
- Each item has multiple properties (title, description, tags, links)
- User needs to choose between options or explore alternatives

**Avoid when**:
- Single item or continuous narrative
- Primarily temporal data
- Long-form explanatory content

**Example triggers**: "projects", "options", "alternatives", "compare", "showcase", "portfolio", "menu"

### When to Use Markdown
**Use for**: Default text content, explanations, conversations, error messages
**Ideal when**:
- Providing explanations or analysis
- Responding to questions that don't require structured data
- Error scenarios or fallback content
- Mixed content with formatting needs

**Default choice**: When other components don't clearly fit the data structure

## Component Composition Patterns

### Effective Combinations

**Timeline + Markdown**: Historical context with detailed explanation
```
Use timeline for key events, markdown for analysis or additional context
Example: Project milestones with lessons learned
```

**Cards + Markdown**: Item showcase with narrative
```
Use cards for distinct projects/options, markdown for introduction or summary
Example: Portfolio projects with career narrative
```

**Multiple Cards**: Categorized content presentation
```
Group related items in separate card components
Example: Professional projects vs. personal projects
```

### Composition Guidelines

1. **Lead with structure**: If data is structured, choose structured component first
2. **Support with context**: Add markdown for explanation when needed
3. **Maintain focus**: Don't overwhelm with too many different component types
4. **Consider user intent**: Match component choice to what user is trying to accomplish

## Context-Appropriate Selection

### User Intent Scenarios

**"Show me your projects"** → Cards component
- User wants to see distinct items they can explore
- Each project has multiple attributes to display
- Natural comparison and selection scenario

**"What's your professional timeline?"** → Timeline component  
- User specifically asks for chronological information
- Focus on progression and development over time
- Dates and sequences are primary organizing principle

**"Tell me about your experience with X"** → Markdown component
- User wants explanatory content and analysis
- Conversational response expected
- No clear structural data to present

**"What are my options for X?"** → Cards component
- User needs to choose between alternatives
- Each option has distinct characteristics
- Comparison and decision-making context

### Data Structure Indicators

**Timeline data signals**:
- `date`, `timestamp`, `year`, `when` fields
- Arrays with temporal ordering
- Process steps or sequential events

**Cards data signals**:
- Arrays of objects with `title`, `description`
- Multiple distinct items with metadata
- Objects with `tags`, `links`, or `actions`

**Markdown data signals**:
- Single string content
- Explanatory or conversational text
- Error messages or fallback content

## Error Handling for Agents

### Component Validation Errors
If component data doesn't match schema requirements:
1. **Check required fields**: Ensure all required properties are present
2. **Validate data types**: Verify strings are strings, arrays are arrays
3. **Fallback to markdown**: Use markdown component with explanation of issue

### Component Not Found Errors
If specified component type isn't registered:
1. **Use available alternatives**: Check similar component types
2. **Default to markdown**: Present content as formatted text
3. **Include error context**: Mention the attempted component type

### Graceful Degradation Strategy
1. **Preserve user intent**: Ensure core information is still communicated
2. **Explain limitations**: Let user know why alternative presentation was chosen
3. **Suggest improvements**: Indicate what data structure would enable better presentation

## Best Practices for Agents

### Component Selection Process
1. **Analyze data structure**: What type of data are you working with?
2. **Consider user intent**: What is the user trying to accomplish?
3. **Match to component strengths**: Which component best serves both data and intent?
4. **Plan composition**: Do you need multiple components to tell the complete story?

### Quality Indicators
- **Appropriate structure**: Component choice matches data organization
- **Clear presentation**: Information is easy to scan and understand  
- **Actionable content**: User can easily act on or respond to the information
- **Contextual relevance**: Component choice supports user's immediate needs

### Common Mistakes to Avoid
- Using timeline for non-temporal data
- Using cards for single items
- Over-structuring simple conversational responses
- Mixing too many component types without clear purpose