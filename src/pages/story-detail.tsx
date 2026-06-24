import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoryDetail } from '../components/stories';
import { Button } from '../components/common';
import { useAppDispatch } from '../redux/hooks';
import { clearCurrentStory } from '../redux/slices/storySlice';
import { RoutePaths } from '../routes/routePaths';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => { dispatch(clearCurrentStory()); };
  }, [dispatch]);

  if (!id) return <div>Invalid story ID</div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Button variant="ghost" onClick={() => navigate(RoutePaths.STORIES)}>
          &larr; Back to Stories
        </Button>
      </div>
      <StoryDetail storyId={id} />
    </div>
  );
};

export default StoryDetailPage;
