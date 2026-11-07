// STUB(C0) → Kamsi builds the real one in K1a. Keep the props.
// Round icon button. `label` is required: it becomes aria-label.
import { cx } from './cx';

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'like' | 'pass';
};

const sizes = { sm: 'size-11', md: 'size-14', lg: 'size-16' };
const tones = { default: 'text-ink', like: 'text-like', pass: 'text-pass' };

export function IconButton({ label, size = 'md', tone = 'default', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-surface shadow-button transition-transform duration-(--duration-fast) active:scale-[0.92] disabled:opacity-40',
        sizes[size],
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
