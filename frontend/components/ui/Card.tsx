import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  noPadding = false,
}) => {
  const baseStyles = 'bg-dark-bg-card rounded-xl border border-dark-border-primary transition-all duration-300';
  const hoverStyles = hover ? 'hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-dark-bg-card to-dark-bg-elevated' : '';
  const paddingStyles = noPadding ? '' : 'p-6';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${paddingStyles} ${className}`}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-dark-text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-dark-text-tertiary mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`${className}`}>{children}</div>;
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-dark-border-primary ${className}`}>{children}</div>;
};


