import axios from 'axios';
import { get, post, del } from './apiClient';

export type AttachmentParentType = 'tasks' | 'bugs';

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  url?: string;
  uploadedAt: string;
}

export interface PresignedUrl {
  uploadUrl: string;
  fileKey: string;
}

/** PRD §8.5 — up to 10 files, 25 MB each. SoT §14 presigned-URL upload flow. */
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
export const MAX_ATTACHMENTS = 10;

export const fileService = {
  /** Step 1 — ask the API for a presigned S3 URL. */
  getPresignedUrl: async (fileName: string, contentType: string, size: number) => {
    const res = await post<PresignedUrl>('/api/v1/files/presigned-url', {
      fileName,
      contentType,
      size,
    });
    return res.data;
  },

  /** Step 2 — PUT the bytes straight to S3 (no auth header, raw axios). */
  uploadToStorage: async (
    uploadUrl: string,
    file: File,
    onProgress?: (pct: number) => void,
  ) => {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },

  /** Step 3 — confirm the upload and attach it to the parent item. */
  confirm: async (parentType: AttachmentParentType, parentId: string, fileKey: string, fileName: string) => {
    const res = await post<Attachment>(`/api/v1/${parentType}/${parentId}/attachments`, {
      fileKey,
      fileName,
    });
    return res.data;
  },

  list: async (parentType: AttachmentParentType, parentId: string) => {
    const res = await get<Attachment[]>(`/api/v1/${parentType}/${parentId}/attachments`);
    return res.data;
  },

  remove: async (parentType: AttachmentParentType, parentId: string, attachmentId: string) => {
    await del(`/api/v1/${parentType}/${parentId}/attachments/${attachmentId}`);
  },
};
