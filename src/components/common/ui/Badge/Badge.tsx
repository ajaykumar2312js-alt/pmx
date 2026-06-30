import clsx from 'clsx';
import { Priority, Severity } from '../../../../common/enums';
import styles from '../DataDisplay.module.css';

interface BadgeProps {
  level: Priority | Severity;
  className?: string;
}

export const Badge = ({ level, className }: BadgeProps) => {
  if (!level) return null;
  const colorClass = styles[level.toLowerCase()] || styles.low;
  return (
    <span className={clsx(styles.badge, colorClass, className)}>
      {level}
    </span>
  );
};
