// STUB(C0) → Kamsi builds the real one in K1a. Keep the props.
import { cx } from './cx';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const variants = {
  primary: 'bg-accent text-on-accent',
  secondary: 'bg-surface text-ink border border-line',
  ghost: 'bg-transparent text-ink',
};

const sizes = {
  sm: 'h-9 px-4 text-label',
  md: 'h-11 px-5 text-body',
  lg: 'h-14 px-6 text-body w-full',
};

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-button font-semibold transition-transform duration-(--duration-fast) active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
