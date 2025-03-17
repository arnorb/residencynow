import React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent } from './card';
import { cn } from "@/lib/utils";

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
        className={cn(`${fullWidth ? 'w-full' : ''}`, className)}
      >
        <Skeleton className={height || 'h-16'} />
        {text && (
          <div className="mt-2 flex justify-center">
            <Skeleton className="w-24 h-4" />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      data-testid="spinner-loader"
      className={cn("flex flex-col items-center justify-center", fullWidth ? 'w-full' : '', className)}
    >
      <div className={cn(sizeClasses[size], "border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2")} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export const LoadingRow: React.FC = () => (
  <div className="flex gap-4 items-center p-4 border-b">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="w-20 h-8 rounded-md" />
  </div>
);

export const LoadingCard: React.FC = () => (
  <Card className="mb-3 hover:shadow-sm transition-all">
    <CardContent className="p-4 pt-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="ml-4">
          <Skeleton className="w-20 h-9 rounded-md" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Loader; 