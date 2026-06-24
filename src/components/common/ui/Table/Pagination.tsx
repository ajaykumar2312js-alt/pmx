import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../Button/Button';
import { PaginationMeta } from '../../../../common/types';
import styles from './Table.module.css';

interface PaginationProps {
  meta: PaginationMeta | null;
  onNext: () => void;
  onPrev: () => void;
}

export const Pagination = ({ meta, onNext, onPrev }: PaginationProps) => {
  if (!meta) return null;

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        Showing up to {meta.limit} items
      </div>
      <div className={styles.paginationControls}>
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta.hasPrevPage}
          onClick={onPrev}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={onNext}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
