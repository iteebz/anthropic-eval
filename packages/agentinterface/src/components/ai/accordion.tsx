import { z } from 'zod';
import { register } from '../../registry';
import { Prose } from '../prose';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { ai } from '../../ai';

export const AccordionSchema = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          defaultExpanded: { type: 'boolean' },
        },
        required: ['title', 'content'],
      },
    },
    content: { type: 'string' },
    className: { type: 'string' },
  },
  required: ['sections'],
} as const;

export const metadata = {
  type: 'accordion',
  description:
    'Collapsible sections for organizing content with expandable/collapsible functionality',
  schema: AccordionSchema,
  category: 'interface',
  tags: ['collapsible', 'organization', 'expandable'],
} as const;

const AccordionValidator = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      defaultExpanded: z.boolean().optional(),
    }),
  ),
  content: z.string().optional(),
  className: z.string().optional(),
});

type AccordionData = z.infer<typeof AccordionValidator>;

function AccordionComponent({ sections, content, className }: AccordionData) {
  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <Prose content={content} />
        </div>
      )}

      {sections && sections.length > 0 && (
        <div className="space-y-2">
          {sections.map((section, index) => (
            <Collapsible key={index} defaultOpen={section.defaultExpanded}>
              <div className="rounded-lg border">
                <CollapsibleTrigger className="w-full border-b p-3 text-left">
                  <div className="font-medium">{section.title}</div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3">
                    <Prose content={section.content} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

// CANONICAL: AI() wrapper with auto-registration
export const Accordion = ai(
  'accordion',
  'Collapsible sections for organizing content',
  AccordionComponent
);
