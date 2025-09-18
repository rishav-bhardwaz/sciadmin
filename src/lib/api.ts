// API Configuration and utilities for sciadmin frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/admin/admin';

// API response interface
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error handling
class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
};

const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
  }
};

// Base API client
const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'API Error', errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network Error');
  }
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; admin: any }>> => {
    const response = await apiClient<{ token: string; admin: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
      localStorage.setItem('adminAuth', 'true');
    }

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      removeAuthToken();
    }
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    return apiClient('/profile');
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    return apiClient('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Users API
export const usersApi = {
  getUsers: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ users: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/users?${searchParams.toString()}`);
  },

  getUserById: async (userId: string): Promise<ApiResponse<any>> => {
    return apiClient(`/users/${userId}`);
  },

  updateUserStatus: async (userId: string, status: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },

  blacklistUser: async (userId: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/users/${userId}/blacklist`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  unblacklistUser: async (userId: string): Promise<ApiResponse<any>> => {
    return apiClient(`/users/${userId}/unblacklist`, {
      method: 'PUT',
    });
  },

  deleteUser: async (userId: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },

  getUserStats: async (): Promise<ApiResponse<any>> => {
    return apiClient('/users/stats');
  },
};

// Events API
export const eventsApi = {
  getEvents: async (params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ events: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/events?${searchParams.toString()}`);
  },

  getEventById: async (eventId: string): Promise<ApiResponse<any>> => {
    return apiClient(`/events/${eventId}`);
  },

  createEventStep1: async (data: any): Promise<ApiResponse<any>> => {
    return apiClient('/events/step1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEventStep2: async (eventId: string, data: any): Promise<ApiResponse<any>> => {
    return apiClient(`/events/${eventId}/step2`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateEventStep3: async (eventId: string, data: any): Promise<ApiResponse<any>> => {
    return apiClient(`/events/${eventId}/step3`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  finalizeEvent: async (eventId: string, data: any): Promise<ApiResponse<any>> => {
    return apiClient(`/events/${eventId}/finalize`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateEventStatus: async (eventId: string, status: string, category?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/events/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, category }),
    });
  },

  deleteEvent: async (eventId: string): Promise<ApiResponse<any>> => {
    return apiClient(`/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  getEventRegistrations: async (eventId: string, page?: number, limit?: number): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());

    return apiClient(`/events/${eventId}/registrations?${searchParams.toString()}`);
  },
};

// Content Management API
export const contentApi = {
  getPosts: async (params?: {
    status?: string;
    search?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ posts: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/content/posts?${searchParams.toString()}`);
  },

  getComments: async (params?: {
    status?: string;
    search?: string;
    postId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ comments: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.postId) searchParams.append('postId', params.postId);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/content/comments?${searchParams.toString()}`);
  },

  getFlaggedContent: async (params?: {
    type?: 'post' | 'comment';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ content: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/content/flagged?${searchParams.toString()}`);
  },

  moderatePost: async (postId: string, action: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/content/posts/${postId}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason, notifyUser: true }),
    });
  },

  moderateComment: async (commentId: string, action: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/content/comments/${commentId}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ action, reason, notifyUser: true }),
    });
  },

  deletePost: async (postId: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/content/posts/${postId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason, notifyUser: true }),
    });
  },

  deleteComment: async (commentId: string, reason?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/content/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason, notifyUser: true }),
    });
  },

  getContentReports: async (params?: {
    status?: string;
    type?: 'post' | 'comment';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ reports: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/content/reports?${searchParams.toString()}`);
  },

  actionOnReport: async (reportId: string, action: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient(`/content/reports/${reportId}/action`, {
      method: 'PUT',
      body: JSON.stringify({ action, notes }),
    });
  },

  getContentStats: async (): Promise<ApiResponse<any>> => {
    return apiClient('/content/stats');
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    return apiClient('/analytics/dashboard');
  },

  getUserGrowthAnalytics: async (months?: number): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (months) searchParams.append('months', months.toString());

    return apiClient(`/analytics/users/growth?${searchParams.toString()}`);
  },

  getEventAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiClient('/analytics/events');
  },

  getRevenueAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiClient('/analytics/revenue');
  },

  getEngagementMetrics: async (): Promise<ApiResponse<any>> => {
    return apiClient('/analytics/engagement');
  },

  getAdminActivityAnalytics: async (days?: number): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (days) searchParams.append('days', days.toString());

    return apiClient(`/analytics/admin-activity?${searchParams.toString()}`);
  },
};

// Logging API
export const logsApi = {
  getAdminLogs: async (params?: {
    adminId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (params?.adminId) searchParams.append('adminId', params.adminId);
    if (params?.action) searchParams.append('action', params.action);
    if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params?.toDate) searchParams.append('toDate', params.toDate);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient(`/logs?${searchParams.toString()}`);
  },

  getMyActivity: async (days?: number): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (days) searchParams.append('days', days.toString());

    return apiClient(`/logs/my-activity?${searchParams.toString()}`);
  },
};

// Export error class for error handling
export { ApiError };

// Export default API client for custom requests
export { apiClient };