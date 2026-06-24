import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './Loader.module.css';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 24, className }: SpinnerProps) => {
  return (
    <Loader2 
      size={size} 
      className={clsx(styles.spinner, className)} 
      aria-busy="true" 
      role="progressbar" 
    />
  );
};
