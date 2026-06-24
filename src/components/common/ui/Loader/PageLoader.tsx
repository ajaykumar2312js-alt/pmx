import { Spinner } from './Spinner';
import styles from './Loader.module.css';

export const PageLoader = () => {
  return (
    <div className={styles.pageLoader} aria-live="polite" aria-busy="true">
      <Spinner size={48} />
    </div>
  );
};
