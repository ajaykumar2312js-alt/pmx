import React from 'react';
import clsx from 'clsx';
import styles from '../DataDisplay.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card = ({ children, className, style }: CardProps) => {
  return <div className={clsx(styles.card, className)} style={style}>{children}</div>;
};

export const CardHeader = ({ children, className, style }: CardProps) => {
  return <div className={clsx(styles.cardHeader, className)} style={style}>{children}</div>;
};

export const CardBody = ({ children, className, style }: CardProps) => {
  return <div className={clsx(styles.cardBody, className)} style={style}>{children}</div>;
};

export const CardFooter = ({ children, className, style }: CardProps) => {
  return <div className={clsx(styles.cardFooter, className)} style={style}>{children}</div>;
};
