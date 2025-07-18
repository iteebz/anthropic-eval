import React from 'react';

export interface CompoundComponentProps {
  children: React.ReactNode;
  className?: string;
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
  const variantClasses = {
    default: 'aip-card',
    outlined: 'aip-card aip-border',
    elevated: 'aip-card aip-shadow-lg'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
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

// Simple Form Components (no complex context)
export interface FormProps extends CompoundComponentProps {
  onSubmit?: (e: React.FormEvent) => void;
}

export function CompoundForm({ 
  children, 
  className = '',
  onSubmit 
}: FormProps) {
  return (
    <form className={`aip-form space-y-4 ${className}`} onSubmit={onSubmit}>
      {children}
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
  onChange
}: { 
  className?: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      className={`aip-input ${className}`}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
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