import clsx from 'clsx';
import styles from '../DataDisplay.module.css';

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

export const Avatar = ({ name, src, size = 32, className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={clsx(styles.avatar, className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={name}
      aria-label={`Avatar for ${name}`}
    >
      {src ? <img src={src} alt={name} /> : initials}
    </div>
  );
};
