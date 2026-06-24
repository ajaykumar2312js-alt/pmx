import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { commentService, Comment, CommentParentType } from '../../services/commentService';
import { formatters } from '../../utils/formatters';
import { Avatar, Button, Spinner, Alert, TextArea } from './ui';

interface CommentThreadProps {
  parentType: CommentParentType;
  parentId: string;
}

/** Shared comment list + add box, reused by Task and Bug detail (breakdown S9.3). */
export const CommentThread: React.FC<CommentThreadProps> = ({ parentType, parentId }) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items } = await commentService.list(parentType, parentId);
      setComments(items);
      setError(null);
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [parentType, parentId]);

  useEffect(() => { 
    const initLoad = async () => { await load(); };
    initLoad(); 
  }, [load]);

  const handleAdd = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    // Optimistic add with rollback on failure.
    const optimistic: Comment = {
      id: `tmp-${Date.now()}`,
      body: trimmed,
      authorId: currentUser?.id ?? '',
      author: currentUser
        ? { id: currentUser.id, firstName: currentUser.firstName, lastName: currentUser.lastName }
        : undefined,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    setBody('');
    setSubmitting(true);
    try {
      const mentions = (trimmed.match(/@(\w+)/g) ?? []).map(m => m.slice(1));
      const saved = await commentService.add(parentType, parentId, { body: trimmed, mentions });
      setComments(prev => prev.map(c => (c.id === optimistic.id ? saved : c)));
    } catch (e: unknown) {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      setError((e as { message?: string }).message ?? 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && <Alert severity="error" message={error} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Spinner /></div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: '0.875rem' }}>No comments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map(c => {
            const name = c.author ? `${c.author.firstName} ${c.author.lastName}` : 'Unknown';
            return (
              <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                <Avatar name={name} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                      {formatters.relativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9375rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <TextArea
          label=""
          value={body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
          rows={3}
          placeholder="Add a comment… use @name to mention someone"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          loading={submitting}
          disabled={!body.trim()}
          style={{ alignSelf: 'flex-end' }}
        >
          Comment
        </Button>
      </div>
    </div>
  );
};
