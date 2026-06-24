import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EpicDetail, EpicChildList } from '../components/epics';
import { Button } from '../components/common';
import { useAppDispatch } from '../redux/hooks';
import { clearCurrentEpic } from '../redux/slices/epicSlice';
import { RoutePaths } from '../routes/routePaths';

const EpicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Cleanup epic details on unmount
    return () => {
      dispatch(clearCurrentEpic());
    };
  }, [dispatch]);

  if (!id) return <div>Invalid Epic ID</div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Button variant="ghost" onClick={() => navigate(RoutePaths.EPICS)}>
          &larr; Back to Epics
        </Button>
      </div>

      <EpicDetail epicId={id} />
      
      <EpicChildList />
    </div>
  );
};

export default EpicDetailPage;
