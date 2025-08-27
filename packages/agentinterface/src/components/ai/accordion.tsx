import React, { useState } from 'react';

export interface AccordionSection {
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

export interface AccordionProps {
  sections: AccordionSection[];
  className?: string;
}

function AccordionComponent({ sections, className }: AccordionProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.map((section, index) => section.defaultExpanded ? index : -1).filter(i => i >= 0))
  );

  const toggle = (index: number) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenSections(newOpen);
  };

  return (
    <div className={className}>
      {sections.map((section, index) => (
        <div key={index} className="border rounded mb-2">
          <button 
            className="w-full p-3 text-left border-b font-medium"
            onClick={() => toggle(index)}
          >
            {section.title}
          </button>
          {openSections.has(index) && (
            <div className="p-3">{section.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export const Accordion = AccordionComponent;