import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  title?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  type = 'button',
  style,
  title,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none select-none rounded-2xl font-heading tracking-tight';

  const variantClasses = {
    primary: 'bg-[var(--primary)] text-white shadow-[0_4px_0_var(--primary-dark),0_8px_15px_rgba(79,70,229,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_var(--primary-dark),0_10px_20px_rgba(79,70,229,0.35)] active:translate-y-[2px] active:shadow-[0_2px_0_var(--primary-dark),0_4px_8px_rgba(79,70,229,0.2)]',
    secondary: 'bg-white border-2 border-[var(--slate-200)] text-[var(--foreground)] hover:bg-[var(--slate-50)] hover:border-[var(--slate-300)] shadow-sm',
    success: 'bg-[var(--success)] text-white shadow-[0_4px_0_#16a34a,0_8px_15px_rgba(34,197,94,0.3)] hover:translate-y-[-2px] active:translate-y-[2px]',
    outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-light)]',
    ghost: 'hover:bg-white/50 text-[var(--slate-600)] hover:text-[var(--foreground)]',
  };

  const sizeClasses = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-3 px-6',
    lg: 'text-xl py-4 px-10',
    icon: 'p-3',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer',
        className
      )}
    >
      {children}
    </button>
  );
}