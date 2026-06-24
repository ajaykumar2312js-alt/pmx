import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Paperclip, Trash2, FileText } from 'lucide-react';
import {
  fileService,
  Attachment,
  AttachmentParentType,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
} from '../../services/fileService';
import { Button, Spinner, Alert } from './ui';

interface AttachmentUploaderProps {
  parentType: AttachmentParentType;
  parentId: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Presigned-URL upload flow shared by Task (S9.4) and Bug. */
export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ parentType, parentId }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fileService.list(parentType, parentId));
      setError(null);
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? 'Failed to load attachments.');
    } finally {
      setLoading(false);
    }
  }, [parentType, parentId]);

  useEffect(() => { 
    const initLoad = async () => { await load(); };
    initLoad(); 
  }, [load]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    if (items.length >= MAX_ATTACHMENTS) {
      setError(`A maximum of ${MAX_ATTACHMENTS} files is allowed.`);
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError('File exceeds the 25 MB limit.');
      return;
    }

    setError(null);
    setProgress(0);
    try {
      const { uploadUrl, fileKey } = await fileService.getPresignedUrl(file.name, file.type, file.size);
      await fileService.uploadToStorage(uploadUrl, file, setProgress);
      const saved = await fileService.confirm(parentType, parentId, fileKey, file.name);
      setItems(prev => [...prev, saved]);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Upload failed.');
    } finally {
      setProgress(null);
    }
  };

  const handleRemove = async (id: string) => {
    const prev = items;
    setItems(items.filter(a => a.id !== id));
    try {
      await fileService.remove(parentType, parentId, id);
    } catch (err: unknown) {
      setItems(prev);
      setError((err as { message?: string }).message ?? 'Failed to remove attachment.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {error && <Alert severity="error" message={error} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}><Spinner size={20} /></div>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: '0.875rem' }}>No attachments.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(a => (
            <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-neutral-200)', borderRadius: 6 }}>
              <FileText size={16} style={{ color: 'var(--color-neutral-500)' }} />
              <span style={{ flex: 1, fontSize: '0.875rem' }}>{a.fileName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{formatSize(a.size)}</span>
              <button
                type="button"
                onClick={() => handleRemove(a.id)}
                aria-label={`Remove ${a.fileName}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', display: 'flex' }}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {progress !== null && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>Uploading… {progress}%</div>
      )}

      <input ref={inputRef} type="file" onChange={handleFile} style={{ display: 'none' }} />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null || items.length >= MAX_ATTACHMENTS}
        style={{ alignSelf: 'flex-start' }}
      >
        <Paperclip size={14} style={{ marginRight: '0.25rem' }} /> Attach file
      </Button>
    </div>
  );
};
