import React from 'react';
import { components, px } from '../tokens/tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional title rendered above children with grid-aligned spacing. */
  title?: React.ReactNode;
}

/**
 * Card — padding 24, radius 8, internal stack gap 16. All grid-aligned.
 */
export const Card: React.FC<CardProps> = ({ title, style, children, ...rest }) => {
  const t = components.card;
  const baseStyle: React.CSSProperties = {
    padding: px(t.padding),
    borderRadius: px(t.radius),
    border: '1px solid #D6D6D0',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: px(t.gap),
  };

  return (
    <div style={{ ...baseStyle, ...style }} {...rest}>
      {title && (
        <h3 style={{ margin: 0, fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
