import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  variant?: 'premium' | 'glass' | 'flat';
  style?: React.CSSProperties;
}

export function Card({
  children,
  className,
  onClick,
  hover = true,
  variant = 'premium',
  style
}: CardProps) {
  const baseClasses = {
    premium: 'premium-card',
    glass: 'glass-card',
    flat: 'bg-white border-2 border-[var(--slate-100)] rounded-3xl shadow-sm'
  }[variant];

  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(baseClasses, hover && 'cursor-pointer', className)}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  const baseClasses = 'p-6 pb-2';

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  const baseClasses = 'p-6';

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  const baseClasses = 'p-5 pt-0';

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
}