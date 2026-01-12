'use client';

import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type IconVariant = 'outline' | 'solid';

interface IconProps {
  readonly name: string; // Changed to string to accept dynamic values
  readonly variant?: IconVariant;
  readonly size?: number;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly [key: string]: any;
}

function Icon({
  name,
  variant = 'outline',
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: Readonly<IconProps>) {
  const iconSet = variant === 'solid' ? HeroIconsSolid : HeroIcons;
  const IconComponent = iconSet[name as keyof typeof iconSet] as React.ComponentType<any>;

  const getClassName = () => {
    let base = className;
    if (disabled) {
      base = `opacity-50 cursor-not-allowed ${base}`;
    } else if (onClick) {
      base = `cursor-pointer hover:opacity-80 ${base}`;
    }
    return base;
  };

  if (!IconComponent) {
    return (
      <QuestionMarkCircleIcon
        width={size}
        height={size}
        className={`text-gray-400 ${getClassName()}`}
        onClick={disabled ? undefined : onClick}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={getClassName()}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default Icon;
