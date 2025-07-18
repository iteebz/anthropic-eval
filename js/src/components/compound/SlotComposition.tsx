import React, { 
  createContext, 
  useContext, 
  Children, 
  isValidElement, 
  cloneElement,
  useMemo,
  useCallback,
  ReactElement,
  ReactNode
} from 'react';
import { z } from 'zod';

// Zod schemas for slot validation
const SlotSchema = z.object({
  name: z.string(),
  required: z.boolean().default(false),
  allowMultiple: z.boolean().default(false),
  defaultContent: z.any().optional(),
  validation: z.function().args(z.any()).returns(z.boolean()).optional()
});

const SlotConfigSchema = z.record(SlotSchema);

export type SlotConfig = z.infer<typeof SlotSchema>;
export type SlotRegistry = Record<string, SlotConfig>;

// Slot context for managing slot composition
interface SlotContextValue {
  slots: Record<string, ReactElement[]>;
  registerSlot: (name: string, element: ReactElement) => void;
  unregisterSlot: (name: string, element: ReactElement) => void;
  getSlot: (name: string) => ReactElement[];
  hasSlot: (name: string) => boolean;
  config: SlotRegistry;
}

const SlotContext = createContext<SlotContextValue | null>(null);

export function useSlotContext(): SlotContextValue {
  const context = useContext(SlotContext);
  if (!context) {
    throw new Error('Slot components must be used within a SlotProvider');
  }
  return context;
}

// Slot provider component
export interface SlotProviderProps {
  children: ReactNode;
  config: SlotRegistry;
  className?: string;
}

export function SlotProvider({ children, config, className = '' }: SlotProviderProps) {
  const [slots, setSlots] = React.useState<Record<string, ReactElement[]>>({});

  const registerSlot = useCallback((name: string, element: ReactElement) => {
    setSlots(prev => {
      const existing = prev[name] || [];
      const slotConfig = config[name];
      
      if (!slotConfig?.allowMultiple && existing.length > 0) {
        console.warn(`Slot "${name}" does not allow multiple elements. Replacing existing content.`);
        return { ...prev, [name]: [element] };
      }
      
      return { ...prev, [name]: [...existing, element] };
    });
  }, [config]);

  const unregisterSlot = useCallback((name: string, element: ReactElement) => {
    setSlots(prev => {
      const existing = prev[name] || [];
      const filtered = existing.filter(el => el !== element);
      return { ...prev, [name]: filtered };
    });
  }, []);

  const getSlot = useCallback((name: string): ReactElement[] => {
    const slotContent = slots[name];
    const slotConfig = config[name];
    
    if (!slotContent || slotContent.length === 0) {
      if (slotConfig?.defaultContent) {
        return [slotConfig.defaultContent];
      }
      return [];
    }
    
    return slotContent;
  }, [slots, config]);

  const hasSlot = useCallback((name: string): boolean => {
    return (slots[name] || []).length > 0;
  }, [slots]);

  const contextValue: SlotContextValue = useMemo(() => ({
    slots,
    registerSlot,
    unregisterSlot,
    getSlot,
    hasSlot,
    config
  }), [slots, registerSlot, unregisterSlot, getSlot, hasSlot, config]);

  return (
    <SlotContext.Provider value={contextValue}>
      <div className={`aip-slot-container ${className}`}>
        {children}
      </div>
    </SlotContext.Provider>
  );
}

// Slot component for defining slots
export interface SlotProps {
  name: string;
  fallback?: ReactNode;
  className?: string;
  wrapper?: (children: ReactNode) => ReactElement;
}

export function Slot({ name, fallback, className = '', wrapper }: SlotProps) {
  const { getSlot, hasSlot, config } = useSlotContext();
  const slotContent = getSlot(name);
  const slotConfig = config[name];

  // Validate required slots
  React.useEffect(() => {
    if (slotConfig?.required && !hasSlot(name)) {
      console.error(`Required slot "${name}" is missing content`);
    }
  }, [name, hasSlot, slotConfig]);

  if (slotContent.length === 0) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (slotConfig?.defaultContent) {
      return <>{slotConfig.defaultContent}</>;
    }
    return null;
  }

  const content = slotContent.map((element, index) => 
    cloneElement(element, { key: element.key || index })
  );

  if (wrapper) {
    return wrapper(content);
  }

  return (
    <div className={`aip-slot aip-slot-${name} ${className}`}>
      {content}
    </div>
  );
}

// Fill component for filling slots
export interface FillProps {
  slot: string;
  children: ReactNode;
  priority?: number;
}

export function Fill({ slot, children, priority = 0 }: FillProps) {
  const { registerSlot, unregisterSlot, config } = useSlotContext();
  
  const element = React.useMemo(() => {
    const el = (
      <div data-slot={slot} data-priority={priority}>
        {children}
      </div>
    ) as ReactElement;
    
    // Validate slot content if validator exists
    const slotConfig = config[slot];
    if (slotConfig?.validation && !slotConfig.validation(children)) {
      console.error(`Invalid content for slot "${slot}"`);
      return null;
    }
    
    return el;
  }, [children, slot, priority, config]);

  React.useEffect(() => {
    if (element) {
      registerSlot(slot, element);
      return () => unregisterSlot(slot, element);
    }
  }, [element, slot, registerSlot, unregisterSlot]);

  return null;
}

// Higher-order component for slot composition
export function withSlots<P extends object>(
  Component: React.ComponentType<P>,
  slotConfig: SlotRegistry
) {
  return function WithSlotsComponent(props: P & { children?: ReactNode }) {
    const { children, ...componentProps } = props;
    
    return (
      <SlotProvider config={slotConfig}>
        <Component {...(componentProps as P)} />
        {children}
      </SlotProvider>
    );
  };
}

// Compound Card with Slots
export interface SlottedCardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  children?: ReactNode;
}

const cardSlotConfig: SlotRegistry = {
  header: {
    name: 'header',
    required: false,
    allowMultiple: false,
    defaultContent: null
  },
  body: {
    name: 'body',
    required: true,
    allowMultiple: false,
    defaultContent: <div className="aip-card-body-empty">No content</div>
  },
  footer: {
    name: 'footer',
    required: false,
    allowMultiple: false,
    defaultContent: null
  },
  actions: {
    name: 'actions',
    required: false,
    allowMultiple: true,
    defaultContent: null
  }
};

export function SlottedCard({ variant = 'default', className = '', children }: SlottedCardProps) {
  const variantClasses = {
    default: 'aip-card',
    outlined: 'aip-card aip-border',
    elevated: 'aip-card aip-shadow-lg'
  };

  return (
    <SlotProvider config={cardSlotConfig}>
      <div className={`${variantClasses[variant]} ${className}`}>
        <Slot name="header" wrapper={(content) => (
          <div className="aip-card-header border-b aip-border-primary aip-p-md">
            {content}
          </div>
        )} />
        
        <Slot name="body" wrapper={(content) => (
          <div className="aip-card-body aip-p-md">
            {content}
          </div>
        )} />
        
        <Slot name="actions" wrapper={(content) => (
          <div className="aip-card-actions flex gap-2 aip-p-md">
            {content}
          </div>
        )} />
        
        <Slot name="footer" wrapper={(content) => (
          <div className="aip-card-footer border-t aip-border-primary aip-p-md">
            {content}
          </div>
        )} />
      </div>
      {children}
    </SlotProvider>
  );
}

// Compound Layout with Slots
export interface SlottedLayoutProps {
  className?: string;
  children?: ReactNode;
}

const layoutSlotConfig: SlotRegistry = {
  header: {
    name: 'header',
    required: false,
    allowMultiple: false,
    defaultContent: null
  },
  sidebar: {
    name: 'sidebar',
    required: false,
    allowMultiple: false,
    defaultContent: null
  },
  main: {
    name: 'main',
    required: true,
    allowMultiple: false,
    defaultContent: <div>Main content area</div>
  },
  footer: {
    name: 'footer',
    required: false,
    allowMultiple: false,
    defaultContent: null
  }
};

export function SlottedLayout({ className = '', children }: SlottedLayoutProps) {
  const { hasSlot } = useSlotContext();
  
  return (
    <SlotProvider config={layoutSlotConfig}>
      <div className={`aip-layout min-h-screen flex flex-col ${className}`}>
        <Slot name="header" wrapper={(content) => (
          <header className="aip-layout-header">
            {content}
          </header>
        )} />
        
        <div className="aip-layout-content flex-1 flex">
          <Slot name="sidebar" wrapper={(content) => (
            <aside className="aip-layout-sidebar w-64 border-r aip-border-primary">
              {content}
            </aside>
          )} />
          
          <main className={`aip-layout-main flex-1 ${hasSlot('sidebar') ? 'ml-0' : ''}`}>
            <Slot name="main" />
          </main>
        </div>
        
        <Slot name="footer" wrapper={(content) => (
          <footer className="aip-layout-footer border-t aip-border-primary">
            {content}
          </footer>
        )} />
      </div>
      {children}
    </SlotProvider>
  );
}

// Compound Modal with Slots
export interface SlottedModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

const modalSlotConfig: SlotRegistry = {
  header: {
    name: 'header',
    required: false,
    allowMultiple: false,
    defaultContent: null
  },
  body: {
    name: 'body',
    required: true,
    allowMultiple: false,
    defaultContent: <div>Modal content</div>
  },
  footer: {
    name: 'footer',
    required: false,
    allowMultiple: false,
    defaultContent: null
  }
};

export function SlottedModal({ 
  isOpen, 
  onClose, 
  size = 'md', 
  className = '',
  children 
}: SlottedModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <SlotProvider config={modalSlotConfig}>
      <div className="aip-modal-overlay fixed inset-0 z-50 flex items-center justify-center aip-bg-overlay">
        <div 
          className="aip-modal-backdrop absolute inset-0"
          onClick={onClose}
        />
        <div className={`aip-modal-content aip-card aip-shadow-xl relative ${sizeClasses[size]} w-full mx-4 ${className}`}>
          <Slot name="header" wrapper={(content) => (
            <div className="aip-modal-header flex items-center justify-between aip-p-md border-b aip-border-primary">
              <div className="aip-modal-title aip-text-lg aip-font-semibold">
                {content}
              </div>
              <button 
                className="aip-modal-close aip-button aip-button-secondary aip-text-sm"
                onClick={onClose}
              >
                ×
              </button>
            </div>
          )} />
          
          <div className="aip-modal-body aip-p-md">
            <Slot name="body" />
          </div>
          
          <Slot name="footer" wrapper={(content) => (
            <div className="aip-modal-footer flex items-center justify-end aip-gap-sm aip-p-md border-t aip-border-primary">
              {content}
            </div>
          )} />
        </div>
      </div>
      {children}
    </SlotProvider>
  );
}

// Utility functions for slot composition
export function createSlotConfig(config: Record<string, Partial<SlotConfig>>): SlotRegistry {
  const validated: SlotRegistry = {};
  
  Object.entries(config).forEach(([name, slotConfig]) => {
    try {
      validated[name] = SlotSchema.parse({ name, ...slotConfig });
    } catch (error) {
      console.error(`Invalid slot config for "${name}":`, error);
    }
  });
  
  return validated;
}

export function validateSlotUsage(
  component: ReactElement,
  requiredSlots: string[],
  optionalSlots: string[] = []
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allSlots = [...requiredSlots, ...optionalSlots];
  
  // Extract Fill components from children
  const fills = new Set<string>();
  
  const extractFills = (children: ReactNode) => {
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === Fill) {
        const props = child.props as any;
        fills.add(props.slot);
      }
      if (isValidElement(child)) {
        const props = child.props as any;
        if (props.children) {
          extractFills(props.children);
        }
      }
    });
  };
  
  const componentProps = component.props as any;
  extractFills(componentProps.children);
  
  // Check required slots
  requiredSlots.forEach(slot => {
    if (!fills.has(slot)) {
      errors.push(`Required slot "${slot}" is missing`);
    }
  });
  
  // Check for unknown slots
  fills.forEach(slot => {
    if (!allSlots.includes(slot)) {
      errors.push(`Unknown slot "${slot}"`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// Export all slot components
