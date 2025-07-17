import React, { createContext, useContext, Children, isValidElement, cloneElement } from 'react';

// Base compound component pattern
export interface CompoundComponentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CompoundContextValue {
  registerChild: (id: string, component: React.ReactElement) => void;
  unregisterChild: (id: string) => void;
  getChildren: () => Record<string, React.ReactElement>;
}

const CompoundContext = createContext<CompoundContextValue | null>(null);

export function useCompoundContext(): CompoundContextValue {
  const context = useContext(CompoundContext);
  if (!context) {
    throw new Error('Compound component must be used within a compound container');
  }
  return context;
}

// Compound Card Pattern
export interface CompoundCardProps extends CompoundComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
}

export function CompoundCard({ 
  children, 
  className = '',
  variant = 'default'
}: CompoundCardProps) {
  const [registeredChildren, setRegisteredChildren] = React.useState<Record<string, React.ReactElement>>({});

  const registerChild = React.useCallback((id: string, component: React.ReactElement) => {
    setRegisteredChildren(prev => ({ ...prev, [id]: component }));
  }, []);

  const unregisterChild = React.useCallback((id: string) => {
    setRegisteredChildren(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const getChildren = React.useCallback(() => registeredChildren, [registeredChildren]);

  const contextValue: CompoundContextValue = {
    registerChild,
    unregisterChild,
    getChildren
  };

  const variantClasses = {
    default: 'aip-card',
    outlined: 'aip-card aip-border',
    elevated: 'aip-card aip-shadow-lg'
  };

  return (
    <CompoundContext.Provider value={contextValue}>
      <div className={`${variantClasses[variant]} ${className}`}>
        {children}
      </div>
    </CompoundContext.Provider>
  );
}

CompoundCard.Header = function CardHeader({ 
  children, 
  className = '' 
}: CompoundComponentProps) {
  return (
    <div className={`aip-card-header border-b aip-border-primary aip-p-md ${className}`}>
      {children}
    </div>
  );
};

CompoundCard.Body = function CardBody({ 
  children, 
  className = '' 
}: CompoundComponentProps) {
  return (
    <div className={`aip-card-body aip-p-md ${className}`}>
      {children}
    </div>
  );
};

CompoundCard.Footer = function CardFooter({ 
  children, 
  className = '' 
}: CompoundComponentProps) {
  return (
    <div className={`aip-card-footer border-t aip-border-primary aip-p-md ${className}`}>
      {children}
    </div>
  );
};

// Compound List Pattern
export interface CompoundListProps extends CompoundComponentProps {
  ordered?: boolean;
  spacing?: 'tight' | 'normal' | 'loose';
}

export function CompoundList({ 
  children, 
  className = '',
  ordered = false,
  spacing = 'normal'
}: CompoundListProps) {
  const spacingClasses = {
    tight: 'aip-gap-xs',
    normal: 'aip-gap-sm',
    loose: 'aip-gap-md'
  };

  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag className={`aip-list flex flex-col ${spacingClasses[spacing]} ${className}`}>
      {children}
    </Tag>
  );
}

CompoundList.Item = function ListItem({ 
  children, 
  className = '',
  active = false,
  disabled = false 
}: CompoundComponentProps & { active?: boolean; disabled?: boolean }) {
  const stateClasses = active ? 'aip-bg-primary aip-text-inverse' : 'aip-text-primary';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <li className={`aip-list-item aip-p-sm aip-rounded ${stateClasses} ${disabledClasses} ${className}`}>
      {children}
    </li>
  );
};

// Compound Navigation Pattern
export interface CompoundNavProps extends CompoundComponentProps {
  orientation?: 'horizontal' | 'vertical';
}

export function CompoundNav({ 
  children, 
  className = '',
  orientation = 'horizontal' 
}: CompoundNavProps) {
  const orientationClasses = {
    horizontal: 'flex flex-row aip-gap-md',
    vertical: 'flex flex-col aip-gap-sm'
  };

  return (
    <nav className={`aip-nav ${orientationClasses[orientation]} ${className}`}>
      {children}
    </nav>
  );
}

CompoundNav.Item = function NavItem({ 
  children, 
  className = '',
  active = false,
  href,
  onClick
}: CompoundComponentProps & { 
  active?: boolean; 
  href?: string; 
  onClick?: () => void; 
}) {
  const activeClasses = active ? 'aip-text-primary aip-font-semibold' : 'aip-text-secondary';
  const baseClasses = `aip-nav-item aip-transition hover:aip-text-primary ${activeClasses}`;
  
  if (href) {
    return (
      <a 
        href={href}
        className={`${baseClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button 
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Compound Form Pattern
export interface CompoundFormProps extends CompoundComponentProps {
  onSubmit?: (data: Record<string, any>) => void;
}

export function CompoundForm({ 
  children, 
  className = '',
  onSubmit 
}: CompoundFormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const updateFormData = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form 
      className={`aip-form space-y-4 ${className}`}
      onSubmit={handleSubmit}
    >
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { updateFormData } as any);
        }
        return child;
      })}
    </form>
  );
}

CompoundForm.Field = function FormField({ 
  children, 
  className = '',
  label,
  error,
  required = false
}: CompoundComponentProps & { 
  label?: string; 
  error?: string; 
  required?: boolean; 
}) {
  return (
    <div className={`aip-form-field ${className}`}>
      {label && (
        <label className="aip-form-label aip-text-sm aip-font-medium aip-text-secondary block mb-1">
          {label}
          {required && <span className="aip-text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="aip-form-error aip-text-xs aip-text-error mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

CompoundForm.Input = function FormInput({ 
  className = '',
  name,
  type = 'text',
  placeholder,
  required = false,
  updateFormData
}: { 
  className?: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  updateFormData?: (name: string, value: any) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData?.(name, e.target.value);
  };

  return (
    <input
      className={`aip-input ${className}`}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      onChange={handleChange}
    />
  );
};

CompoundForm.Button = function FormButton({ 
  children, 
  className = '',
  type = 'submit',
  variant = 'primary'
}: CompoundComponentProps & { 
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
}) {
  const variantClasses = {
    primary: 'aip-button-primary',
    secondary: 'aip-button-secondary'
  };

  return (
    <button 
      type={type}
      className={`aip-button ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Compound Modal Pattern
export interface CompoundModalProps extends CompoundComponentProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CompoundModal({ 
  children, 
  className = '',
  isOpen,
  onClose,
  size = 'md'
}: CompoundModalProps) {
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
    <div className="aip-modal-overlay fixed inset-0 z-50 flex items-center justify-center aip-bg-overlay">
      <div 
        className="aip-modal-backdrop absolute inset-0"
        onClick={onClose}
      />
      <div className={`aip-modal-content aip-card aip-shadow-xl relative ${sizeClasses[size]} w-full mx-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}

CompoundModal.Header = function ModalHeader({ 
  children, 
  className = '',
  showClose = true,
  onClose
}: CompoundComponentProps & { 
  showClose?: boolean; 
  onClose?: () => void; 
}) {
  return (
    <div className={`aip-modal-header flex items-center justify-between aip-p-md border-b aip-border-primary ${className}`}>
      <div className="aip-modal-title aip-text-lg aip-font-semibold">
        {children}
      </div>
      {showClose && (
        <button 
          className="aip-modal-close aip-button aip-button-secondary aip-text-sm"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};

CompoundModal.Body = function ModalBody({ 
  children, 
  className = '' 
}: CompoundComponentProps) {
  return (
    <div className={`aip-modal-body aip-p-md ${className}`}>
      {children}
    </div>
  );
};

CompoundModal.Footer = function ModalFooter({ 
  children, 
  className = '' 
}: CompoundComponentProps) {
  return (
    <div className={`aip-modal-footer flex items-center justify-end aip-gap-sm aip-p-md border-t aip-border-primary ${className}`}>
      {children}
    </div>
  );
};