import clsx from 'clsx';
import styles from './Loader.module.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className, width, height }: SkeletonProps) => {
  return (
    <div 
      className={clsx(styles.skeleton, className)} 
      style={{ width, height }}
      aria-busy="true"
      aria-hidden="true"
    />
  );
};
