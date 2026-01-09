import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  textClassName = '',
  ...props
}) => {
  // Variantes de botón
  const variantStyles = {
    primary: 'bg-purple-600 active:bg-purple-700',
    secondary: 'bg-gray-600 active:bg-gray-700',
    success: 'bg-green-600 active:bg-green-700',
    danger: 'bg-red-600 active:bg-red-700',
    outline: 'bg-transparent border border-purple-600 active:bg-purple-50',
    ghost: 'bg-transparent active:bg-purple-50',
  };

  // Tamaños de botón
  const sizeStyles = {
    sm: 'py-1 px-3',
    md: 'py-2 px-4',
    lg: 'py-3 px-6',
  };

  // Estilos de texto según variante
  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    success: 'text-white',
    danger: 'text-white',
    outline: 'text-purple-600',
    ghost: 'text-purple-600',
  };

  // Estilos de texto según tamaño
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        rounded-lg
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}>
      <Text
        className={`
          text-center
          font-semibold
          ${textSizeStyles[size]}
          ${textVariantStyles[variant]}
          ${textClassName}
        `}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
