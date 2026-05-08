import React from 'react';
import { spacing, SpacingToken, px } from '../tokens/tokens';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between children. Maps to the spacing scale (8px grid). */
  gap?: SpacingToken;
  /** 'row' | 'column' (default 'column'). */
  direction?: 'row' | 'column';
  /** Padding (uniform) from the spacing scale. */
  padding?: SpacingToken;
}

/**
 * Stack — layout primitive that enforces the grid via the spacing scale.
 * Use this instead of arbitrary margins to keep rhythm consistent.
 */
export const Stack: React.FC<StackProps> = ({
  gap = 'sm',
  direction = 'column',
  padding,
  style,
  children,
  ...rest
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap: px(spacing[gap]),
    ...(padding ? { padding: px(spacing[padding]) } : null),
  };

  return (
    <div style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </div>
  );
};

export default Stack;
