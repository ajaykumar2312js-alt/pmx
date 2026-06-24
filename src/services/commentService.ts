import { get, post, buildPaginationParams, PaginationParams } from './apiClient';
import { PaginationMeta } from '../common/types';

/** Polymorphic parent kinds that support a comment thread. */
export type CommentParentType = 'tasks' | 'bugs' | 'stories';

export interface Comment {
  id: string;
  body: string;
  authorId: string;
  author?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface CommentPayload {
  body: string;
  mentions?: string[];
}

/**
 * Shared by Task (S9.3) and Bug detail. The {parentType} segment is one of the
 * kebab-case plural item collections per the SoT URL contract.
 */
export const commentService = {
  list: async (parentType: CommentParentType, parentId: string, params: PaginationParams = {}) => {
    const res = await get<Comment[]>(`/api/v1/${parentType}/${parentId}/comments`, {
      params: buildPaginationParams(params),
    });
    return { items: res.data, meta: res.meta as PaginationMeta };
  },

  add: async (parentType: CommentParentType, parentId: string, payload: CommentPayload) => {
    const res = await post<Comment>(`/api/v1/${parentType}/${parentId}/comments`, payload);
    return res.data;
  },
};
