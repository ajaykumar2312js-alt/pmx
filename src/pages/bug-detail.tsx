import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BugDetail } from '../components/bugs';
import { Alert, Button } from '../components/common';
import { ArrowLeft } from 'lucide-react';

const BugDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <Alert severity="error" message="No bug ID provided." />;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
      <BugDetail bugId={id} />
    </div>
  );
};

export default BugDetailPage;
