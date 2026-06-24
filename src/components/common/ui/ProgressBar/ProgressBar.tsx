import React from 'react';
import styles from './ProgressBar.module.css';
import clsx from 'clsx';

interface ProgressBarProps {
  percent: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent, label, className }) => {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={clsx(styles.container, className)} role="progressbar" aria-valuenow={clampedPercent} aria-valuemin={0} aria-valuemax={100}>
      {label && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>{label}</span>
          <span className={styles.percentText}>{Math.round(clampedPercent)}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div 
          className={styles.fill} 
          style={{ width: `${clampedPercent}%` }} 
        />
      </div>
    </div>
  );
};
