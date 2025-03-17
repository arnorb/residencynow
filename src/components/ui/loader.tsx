import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';
type LoaderVariant = 'spinner' | 'skeleton';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  text?: string;
  className?: string;
  fullWidth?: boolean;
  height?: string;
}

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4',
  width = 'w-full',
  rounded = 'md'
}) => {
  const roundedClass = {
    'none': '',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'full': 'rounded-full'
  }[rounded];

  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse bg-gray-200 ${height} ${width} ${roundedClass} ${className}`}
    />
  );
};

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  text,
  className = '',
  fullWidth = false,
  height
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  if (variant === 'skeleton') {
    return (
      <div 
        data-testid="skeleton-loader"
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <Skeleton height={height || 'h-16'} rounded="md" />
        {text && (
          <div className="mt-2 flex justify-center">
            <Skeleton width="w-24" height="h-4" />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      data-testid="spinner-loader"
      className={`flex flex-col items-center justify-center ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <div className={`${sizeClasses[size]} border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export const LoadingRow: React.FC = () => (
  <div className="flex gap-4 items-center p-4 border-b">
    <Skeleton width="w-12" height="h-12" rounded="full" />
    <div className="flex-1">
      <Skeleton height="h-4" width="w-3/4" className="mb-2" />
      <Skeleton height="h-3" width="w-1/2" />
    </div>
    <Skeleton width="w-20" height="h-8" rounded="md" />
  </div>
);

export const LoadingCard: React.FC = () => (
  <div className="bg-white rounded-lg border mb-3 p-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <Skeleton height="h-5" width="w-1/3" className="mb-2" />
        <Skeleton height="h-4" width="w-3/4" className="mb-1" />
        <Skeleton height="h-4" width="w-1/2" />
      </div>
      <div className="ml-4">
        <Skeleton width="w-20" height="h-9" rounded="md" />
      </div>
    </div>
  </div>
);

export default Loader; 