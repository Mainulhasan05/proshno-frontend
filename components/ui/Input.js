'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    type = 'text',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    id,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-neutral-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-800 transition-all duration-150',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            error
              ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
              : 'border-neutral-300 hover:border-neutral-400',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-4 w-4 text-neutral-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{helper}</p>
      )}
    </div>
  );
});

export default Input;
