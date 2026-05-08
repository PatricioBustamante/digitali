import React from 'react';
import { components, px } from '../tokens/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Button — height 40px, padding 12×16, radius 8.
 * All values come from `components.button` tokens (8px grid).
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  style,
  children,
  ...rest
}) => {
  const t = components.button;
  const compactPadY = size === 'sm' ? 8 : t.paddingY;

  const baseStyle: React.CSSProperties = {
    height: size === 'sm' ? 32 : t.height,
    padding: `${px(compactPadY)} ${px(t.paddingX)}`,
    borderRadius: px(t.radius),
    fontSize: px(t.fontSize),
    lineHeight: px(t.lineHeight),
    fontWeight: 600,
    border: '1px solid transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 0.15s ease, border-color 0.15s ease',
  };

  const variantStyle: Record<Variant, React.CSSProperties> = {
    primary:   { background: '#0046E0', color: '#FFFFFF' },
    secondary: { background: '#F0F0EC', color: '#111111', borderColor: '#D6D6D0' },
    ghost:     { background: 'transparent', color: '#111111' },
  };

  return (
    <button style={{ ...baseStyle, ...variantStyle[variant], ...style }} {...rest}>
      {children}
    </button>
  );
};

export default Button;
