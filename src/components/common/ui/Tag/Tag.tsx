import clsx from 'clsx';
import { SprintStatus, DeploymentStatus } from '../../../../common/enums';
import styles from '../DataDisplay.module.css';

export interface TagProps {
  status: SprintStatus | DeploymentStatus | string;
  className?: string;
}

export const Tag = ({ status, className }: TagProps) => {
  const colorClass = styles[status.toLowerCase()] || styles.todo;
  return (
    <span className={clsx(styles.tag, colorClass, className)}>
      {status.replace('_', ' ')}
    </span>
  );
};
