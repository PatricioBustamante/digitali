import React from 'react';
import { components, px } from '../tokens/tokens';

type Tone = 'neutral' | 'info' | 'success' | 'warning';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/**
 * Badge — height 24, padding 4×8, radius 4.
 */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', style, children, ...rest }) => {
  const t = components.badge;
  const palette: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: '#F0F0EC', fg: '#4A4A47' },
    info:    { bg: '#E6EDFF', fg: '#0046E0' },
    success: { bg: '#E2F7E8', fg: '#147A3A' },
    warning: { bg: '#FFF3D6', fg: '#8A5A00' },
  };

  const baseStyle: React.CSSProperties = {
    height: px(t.height),
    padding: `${px(t.paddingY)} ${px(t.paddingX)}`,
    borderRadius: px(t.radius),
    fontSize: px(t.fontSize),
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    background: palette[tone].bg,
    color: palette[tone].fg,
    boxSizing: 'border-box',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  return <span style={{ ...baseStyle, ...style }} {...rest}>{children}</span>;
};

export default Badge;
