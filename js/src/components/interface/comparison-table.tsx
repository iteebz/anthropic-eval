import React, { useState } from 'react';
import { type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

export interface ComparisonItem {
  id: string;
  name: string;
  description?: string;
  attributes: Record<string, any>;
  metadata?: {
    score?: number;
    ranking?: number;
    recommended?: boolean;
    tags?: string[];
    notes?: string;
  };
}

export interface ComparisonAttribute {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'rating' | 'badge' | 'status';
  description?: string;
  weight?: number;
  format?: string;
  options?: string[];
}

export interface ComparisonTableData {
  items: ComparisonItem[];
  attributes: ComparisonAttribute[];
  title?: string;
  description?: string;
  showScores?: boolean;
  showRanking?: boolean;
  allowSorting?: boolean;
  highlightBest?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

export function ComparisonTable({
  content,
  interfaceData,
  className,
  onSendMessage,
}: InterfaceProps) {
  const data = interfaceData as ComparisonTableData;
  const { 
    items = [],
    attributes = [],
    title,
    description,
    showScores = false,
    showRanking = false,
    allowSorting = true,
    highlightBest = false,
    compact = false,
    maxHeight = "500px"
  } = data || {};

  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (attributeKey: string) => {
    if (!allowSorting) return;
    
    if (sortBy === attributeKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(attributeKey);
      setSortOrder('desc');
    }
  };

  const getSortedItems = () => {
    if (!sortBy) return items;
    
    return [...items].sort((a, b) => {
      let aValue = a.attributes[sortBy];
      let bValue = b.attributes[sortBy];
      
      // Handle metadata sorting
      if (sortBy === 'score') {
        aValue = a.metadata?.score || 0;
        bValue = b.metadata?.score || 0;
      } else if (sortBy === 'ranking') {
        aValue = a.metadata?.ranking || 999;
        bValue = b.metadata?.ranking || 999;
      }
      
      // Convert to comparable values
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getBestItem = () => {
    if (!highlightBest || items.length === 0) return null;
    
    // Find item with highest score or lowest ranking
    return items.reduce((best, item) => {
      const bestScore = best.metadata?.score || 0;
      const itemScore = item.metadata?.score || 0;
      const bestRanking = best.metadata?.ranking || 999;
      const itemRanking = item.metadata?.ranking || 999;
      
      if (itemScore > bestScore || (itemScore === bestScore && itemRanking < bestRanking)) {
        return item;
      }
      return best;
    }, items[0]);
  };

  const renderAttributeValue = (item: ComparisonItem, attribute: ComparisonAttribute) => {
    const value = item.attributes[attribute.key];
    
    if (value === undefined || value === null) {
      return <span className="text-gray-400">—</span>;
    }
    
    switch (attribute.type) {
      case 'boolean':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? '✓' : '✗'}
          </span>
        );
      
      case 'rating':
        const rating = Math.max(0, Math.min(5, Number(value) || 0));
        return (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
          </div>
        );
      
      case 'badge':
        const badgeColor = value === 'high' ? 'bg-red-100 text-red-800' :
                          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          value === 'low' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
            {value}
          </span>
        );
      
      case 'status':
        const statusColor = value === 'active' ? 'bg-green-100 text-green-800' :
                           value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                           value === 'inactive' ? 'bg-gray-100 text-gray-800' :
                           'bg-red-100 text-red-800';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {value}
          </span>
        );
      
      case 'number':
        const formattedNumber = attribute.format 
          ? Number(value).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
          : Number(value).toLocaleString();
        return <span className="font-mono">{formattedNumber}</span>;
      
      case 'text':
      default:
        return <span>{String(value)}</span>;
    }
  };

  const renderSortIcon = (attributeKey: string) => {
    if (!allowSorting) return null;
    
    if (sortBy !== attributeKey) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    
    return (
      <span className="text-blue-600 ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const bestItem = getBestItem();
  const sortedItems = getSortedItems();

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}
      
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}
      
      {description && (
        <div className="mb-4 text-gray-600">
          <MarkdownRenderer content={description} />
        </div>
      )}
      
      {items.length > 0 && (
        <div className="overflow-x-auto" style={{ maxHeight }}>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                  {allowSorting ? (
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-gray-900"
                    >
                      Name
                      {renderSortIcon('name')}
                    </button>
                  ) : (
                    'Name'
                  )}
                </th>
                
                {attributes.map(attr => (
                  <th key={attr.key} className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    {allowSorting ? (
                      <button
                        onClick={() => handleSort(attr.key)}
                        className="flex items-center hover:text-gray-900"
                        title={attr.description}
                      >
                        {attr.label}
                        {renderSortIcon(attr.key)}
                      </button>
                    ) : (
                      <span title={attr.description}>{attr.label}</span>
                    )}
                  </th>
                ))}
                
                {showScores && (
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    {allowSorting ? (
                      <button
                        onClick={() => handleSort('score')}
                        className="flex items-center hover:text-gray-900"
                      >
                        Score
                        {renderSortIcon('score')}
                      </button>
                    ) : (
                      'Score'
                    )}
                  </th>
                )}
                
                {showRanking && (
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    {allowSorting ? (
                      <button
                        onClick={() => handleSort('ranking')}
                        className="flex items-center hover:text-gray-900"
                      >
                        Rank
                        {renderSortIcon('ranking')}
                      </button>
                    ) : (
                      'Rank'
                    )}
                  </th>
                )}
                
                {onSendMessage && (
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody>
              {sortedItems.map((item, index) => {
                const isBest = bestItem && item.id === bestItem.id;
                const isRecommended = item.metadata?.recommended;
                
                return (
                  <tr 
                    key={item.id}
                    className={`
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      ${isBest ? 'bg-green-50 border-green-200' : ''}
                      ${isRecommended ? 'bg-blue-50 border-blue-200' : ''}
                      hover:bg-gray-100
                    `}
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {isBest && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Best
                            </span>
                          )}
                          {isRecommended && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        {item.description && !compact && (
                          <div className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {attributes.map(attr => (
                      <td key={attr.key} className="border border-gray-300 px-4 py-2">
                        {renderAttributeValue(item, attr)}
                      </td>
                    ))}
                    
                    {showScores && (
                      <td className="border border-gray-300 px-4 py-2">
                        {item.metadata?.score ? (
                          <span className="font-mono">{item.metadata.score}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    
                    {showRanking && (
                      <td className="border border-gray-300 px-4 py-2">
                        {item.metadata?.ranking ? (
                          <span className="font-mono">#{item.metadata.ranking}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    
                    {onSendMessage && (
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => onSendMessage(`Select ${item.name} (${item.id})`)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Select
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items to compare.
        </div>
      )}
    </div>
  );
}

// Export metadata for the component
ComparisonTable.meta = {
  description: 'Compare multiple items with attributes in a sortable table format',
  category: 'data',
  tags: ['comparison', 'table', 'data', 'sorting', 'analysis'],
  examples: [
    `{{comparison-table:models|title=Model Comparison|showScores=true|highlightBest=true}}`,
    `{{comparison-table:pricing|allowSorting=true|showRanking=true}}`
  ],
  schema: {
    items: {
      type: 'array',
      required: true,
      description: 'Array of items to compare'
    },
    attributes: {
      type: 'array',
      required: true,
      description: 'Array of attributes to compare'
    },
    title: {
      type: 'string',
      description: 'Comparison table title'
    },
    showScores: {
      type: 'boolean',
      description: 'Show score column'
    },
    showRanking: {
      type: 'boolean',
      description: 'Show ranking column'
    },
    allowSorting: {
      type: 'boolean',
      description: 'Allow column sorting'
    },
    highlightBest: {
      type: 'boolean',
      description: 'Highlight best performing item'
    }
  }
};