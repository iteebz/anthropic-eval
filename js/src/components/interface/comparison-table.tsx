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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2 text-left">Name</th>
              {attributes.map(attr => (
                <th key={attr.key} className="border px-4 py-2 text-left">{attr.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border px-4 py-2 font-medium">{item.name}</td>
                {attributes.map(attr => (
                  <td key={attr.key} className="border px-4 py-2">
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