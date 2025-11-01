import { Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'header' | 'hero' | 'compact';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'h-5 w-5', check: 'h-3 w-3', text: 'text-base' },
  md: { container: 'w-12 h-12', icon: 'h-7 w-7', check: 'h-4 w-4', text: 'text-2xl' },
  lg: { container: 'w-16 h-16', icon: 'h-10 w-10', check: 'h-6 w-6', text: 'text-3xl' },
  xl: { container: 'w-20 h-20', icon: 'h-14 w-14', check: 'h-7 w-7', text: 'text-4xl' },
};

export function Logo({
  size = 'md',
  variant = 'header',
  showText = true,
  className
}: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Shield Icon with Gold Trim and Checkmark */}
      <div className="relative group">
        {/* Outer gold glow effect */}
        <div className={cn(
          'absolute inset-0 rounded-xl',
          'bg-gradient-to-br from-amber-400/20 to-amber-500/20',
          'blur-sm group-hover:blur-md transition-all duration-300',
          'group-hover:scale-110'
        )} />

        {/* Main shield container with gold border */}
        <div className={cn(
          sizes.container,
          'relative rounded-xl',
          'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800',
          'border-2 border-amber-400',
          'shadow-lg shadow-amber-500/20',
          'flex items-center justify-center',
          'group-hover:border-amber-300 transition-all duration-300',
          'group-hover:shadow-xl group-hover:shadow-amber-500/30'
        )}>
          {/* Shield icon */}
          <Shield className={cn(
            sizes.icon,
            'text-slate-300',
            'group-hover:text-white transition-colors duration-300'
          )} />

          {/* Checkmark overlay */}
          <div className={cn(
            'absolute',
            'flex items-center justify-center'
          )}>
            <Check className={cn(
              sizes.check,
              'text-emerald-400 font-bold stroke-[3]',
              'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
              'group-hover:text-emerald-300 transition-colors duration-300'
            )} />
          </div>
        </div>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={cn(
            sizes.text,
            'font-bold',
            'bg-gradient-to-r from-white via-slate-200 to-slate-300',
            'bg-clip-text text-transparent',
            'group-hover:from-amber-100 group-hover:via-white group-hover:to-slate-200',
            'transition-all duration-300'
          )}>
            ShadowCheck
          </h1>
          {(variant === 'hero' || size === 'lg' || size === 'xl') && (
            <p className="text-xs text-slate-400 tracking-widest font-mono uppercase">
              SIGINT FORENSICS
            </p>
          )}
        </div>
      )}
    </div>
  );
}
