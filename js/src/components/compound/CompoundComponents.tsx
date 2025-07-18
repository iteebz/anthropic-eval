/**
 * Compound Components - Shadcn-based Compositions
 * 
 * Simple re-exports of shadcn components with composition patterns.
 * Replaces 420 lines of reinvented wheels with proper shadcn usage.
 */

// Re-export shadcn components with compound naming for backward compatibility
export { 
  Card as CompoundCard,
  CardHeader as CompoundCardHeader, 
  CardContent as CompoundCardContent,
  CardFooter as CompoundCardFooter,
  CardTitle as CompoundCardTitle,
  CardDescription as CompoundCardDescription 
} from '../ui/card';

export { 
  Collapsible as CompoundCollapsible,
  CollapsibleTrigger as CompoundCollapsibleTrigger,
  CollapsibleContent as CompoundCollapsibleContent 
} from '../ui/collapsible';

export { Badge as CompoundBadge } from '../ui/badge';

// Keep the compound component props interface for backward compatibility
export interface CompoundComponentProps {
  children: React.ReactNode;
  className?: string;
}

// Simple compound patterns using shadcn primitives
export interface CompoundLayoutProps extends CompoundComponentProps {
  orientation?: 'horizontal' | 'vertical';
}

export function CompoundLayout({ 
  children, 
  className = '',
  orientation = 'vertical' 
}: CompoundLayoutProps) {
  const orientationClasses = {
    horizontal: 'flex flex-row gap-4',
    vertical: 'flex flex-col gap-4'
  };

  return (
    <div className={`${orientationClasses[orientation]} ${className}`}>
      {children}
    </div>
  );
}

// Simple compound list using proper semantic markup
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
    tight: 'space-y-1',
    normal: 'space-y-2', 
    loose: 'space-y-4'
  };

  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </Tag>
  );
}

export interface CompoundListItemProps extends CompoundComponentProps {
  active?: boolean;
  disabled?: boolean;
}

export function CompoundListItem({ 
  children, 
  className = '',
  active = false,
  disabled = false 
}: CompoundListItemProps) {
  const stateClasses = active ? 'bg-accent text-accent-foreground' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <li className={`p-2 rounded-md transition-colors ${stateClasses} ${disabledClasses} ${className}`}>
      {children}
    </li>
  );
}

// Assign sub-components for compound pattern
CompoundList.Item = CompoundListItem;
CompoundCard.Header = CompoundCardHeader;
CompoundCard.Content = CompoundCardContent;
CompoundCard.Footer = CompoundCardFooter;
CompoundCard.Title = CompoundCardTitle;
CompoundCard.Description = CompoundCardDescription;