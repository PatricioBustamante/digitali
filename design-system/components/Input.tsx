import React from 'react';
import { components, px } from '../tokens/tokens';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Input — height 40, padding 8×12, radius 8.
 */
export const Input: React.FC<InputProps> = ({ invalid, style, ...rest }) => {
  const t = components.input;
  const baseStyle: React.CSSProperties = {
    height: px(t.height),
    padding: `${px(t.paddingY)} ${px(t.paddingX)}`,
    borderRadius: px(t.radius),
    fontSize: px(t.fontSize),
    border: `1px solid ${invalid ? '#E03A3A' : '#D6D6D0'}`,
    background: '#FFFFFF',
    color: '#111111',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };

  return <input style={{ ...baseStyle, ...style }} {...rest} />;
};

export default Input;
