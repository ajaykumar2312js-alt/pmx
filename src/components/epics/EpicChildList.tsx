import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentEpicChildren } from '../../redux/slices/epicSlice';
import { Table, Badge, Alert } from '../common';
import { ChildItem } from '../../services/epicService';
import { useNavigate } from 'react-router-dom';

export const EpicChildList: React.FC = () => {
  const children = useAppSelector(selectCurrentEpicChildren);
  const navigate = useNavigate();

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (item: ChildItem) => (
        <span 
          style={{ fontWeight: 500, color: 'var(--color-primary-600)', cursor: 'pointer' }}
          onClick={() => {
            // Simplified navigation for children -> usually goes to a tracker or backlog view.
            // Assuming future E8-10 details are mapped to /tracker/:type/:id
            navigate(`/backlog`); 
          }}
        >
          {item.title}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: ChildItem) => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: 'var(--color-neutral-200)',
          color: 'var(--color-neutral-800)'
        }}>
          {item.type}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ChildItem) => (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
          {item.status}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: ChildItem) => <Badge level={item.priority} />
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (item: ChildItem) => item.owner ? `${item.owner.firstName} ${item.owner.lastName}` : 'Unassigned'
    }
  ];

  if (children.length === 0) {
    return <Alert severity="info" message="This Epic has no child items assigned." />;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Child Items ({children.length})</h3>
      <Table columns={columns} data={children} keyExtractor={c => c.id} />
    </div>
  );
};
