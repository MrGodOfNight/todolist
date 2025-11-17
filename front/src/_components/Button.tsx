import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  // Стили для разных вариантов кнопок
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    outline: 'bg-transparent hover:bg-gray-100 text-gray-800 border border-gray-400'
  };

  // Стили для разных размеров
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12'
  };

  // Общие стили для всех кнопок
  const baseStyles = `
    inline-flex items-center justify-center rounded-md font-medium
    transition-all duration-200 focus:outline-none focus:ring-2
    focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
  `;

  // Комбинированные классы
  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  return (
    <button
      className={combinedClassName}
      disabled={isLoading || disabled}
      aria-disabled={isLoading || disabled}
      {...props}
    >
      {/* Индикатор загрузки */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {/* Левая иконка */}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

      {/* Текст кнопки */}
      {children && <span className={isLoading ? 'opacity-0' : ''}>{children}</span>}

      {/* Правая иконка */}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}