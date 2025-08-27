import React from 'react';

export interface TableItem {
  id: string;
  name: string;
  attributes: Record<string, any>;
}

export interface TableAttribute {
  key: string;
  label: string;
}

export interface TableProps {
  items: TableItem[];
  attributes: TableAttribute[];
  title?: string;
  className?: string;
}

function TableComponent({ items, attributes, title, className }: TableProps) {
  return (
    <div className={className}>
      {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
      <div className="overflow-x-auto rounded border">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              {attributes.map((attr) => (
                <th key={attr.key} className="px-4 py-3 text-left font-medium">
                  {attr.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                {attributes.map((attr) => (
                  <td key={attr.key} className="px-4 py-3 text-gray-600">
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

export const Table = TableComponent;