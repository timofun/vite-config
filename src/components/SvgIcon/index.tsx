import React from 'react';

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  name?: string;
  prefix: string;
  color: string;
}

export default function SvgIcon({
  name,
  prefix = 'icon',
  color = '#333',
  ...props
}: SvgIconProps) {
  const symbolId = `#${prefix}-${name}`;

  return (
    <svg {...props} aria-hidden="true">
      <use href={symbolId} fill={color} />
    </svg>
  );
}
