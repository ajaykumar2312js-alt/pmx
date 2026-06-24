import { Button, Alert } from '../common';
import { EpicForm } from '../epics';
import { StoryForm } from '../stories/StoryForm';

interface MockFormProps {
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
  title: string;
}

const MockForm: React.FC<MockFormProps> = ({ onSubmit, onCancel, title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Alert severity="info" message={`This is a placeholder for the actual ${title} form which will be built in upcoming Epics.`} />
    
    <div style={{ padding: '1rem', background: 'var(--color-neutral-100)', borderRadius: 'var(--border-radius-base)' }}>
      <p style={{ color: 'var(--color-neutral-600)', margin: 0 }}>
        Simulated form fields for {title}...
      </p>
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={() => onSubmit({ mockedData: true })}>
        Refine
      </Button>
    </div>
  </div>
);

export const MockEpicForm: React.FC<Omit<MockFormProps, 'title'>> = ({ onSubmit, onCancel }) => (
  <EpicForm 
    onCancel={onCancel} 
    onSubmit={async (payload) => {
      // Typecasting payload to match the expected format of the Refine API
      onSubmit(payload as unknown as Record<string, unknown>);
    }} 
  />
);
export const MockStoryForm: React.FC<Omit<MockFormProps, 'title'> & { projectId?: string }> = ({ onSubmit, onCancel, projectId = '' }) => (
  <StoryForm
    projectId={projectId}
    onCancel={onCancel}
    onSubmit={async (payload) => { onSubmit(payload as unknown as Record<string, unknown>); }}
  />
);
export const MockTaskForm: React.FC<Omit<MockFormProps, 'title'>> = (props) => <MockForm title="Task" {...props} />;
export const MockBugForm: React.FC<Omit<MockFormProps, 'title'>> = (props) => <MockForm title="Bug" {...props} />;
