import React from 'react';
import { z } from 'zod';
import { register } from '../../registry';

export const TableSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          attributes: { type: "object" }
        },
        required: ["id", "name", "attributes"]
      }
    },
    attributes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          type: { type: "string", enum: ["text", "number", "boolean"] }
        },
        required: ["key", "label"]
      }
    },
    title: { type: "string" },
    className: { type: "string" }
  },
  required: ["items", "attributes"]
} as const;

export const metadata = {
  type: "table",
  description: "Display structured data in a comparison table format with customizable columns and attributes",
  schema: TableSchema,
  category: "interface",
  tags: ["data", "comparison", "structured"]
} as const;

const TableValidator = z.object({
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

type TableData = z.infer<typeof TableValidator>;

export function Table(props: TableData) {
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
register({
  type: 'table',
  schema: TableValidator,
  render: Table
});