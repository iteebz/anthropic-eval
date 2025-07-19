import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';

const ComparisonTableSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    attributes: z.record(z.any())
  })),
  attributes: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'boolean']).optional()
  })),
  title: z.string().optional(),
  className: z.string().optional()
});

type ComparisonTableData = z.infer<typeof ComparisonTableSchema>;

export function ComparisonTable(props: ComparisonTableData) {
  const { items, attributes, title, className } = props;

  return (
    <div className={className}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              {attributes.map(attr => (
                <th key={attr.key} className="px-4 py-3 text-left font-medium">{attr.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/25">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                {attributes.map(attr => (
                  <td key={attr.key} className="px-4 py-3 text-muted-foreground">
                    {String(item.attributes[attr.key] || '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'comparison-table',
  schema: ComparisonTableSchema,
  render: ComparisonTable
});