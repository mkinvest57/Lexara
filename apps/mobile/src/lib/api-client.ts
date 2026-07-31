const API_URL = 'http://localhost:3001/api';

export interface ApiError {
  message: string;
  statusCode: number;
  code?: 'API_UNAVAILABLE';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch {
      throw {
        code: 'API_UNAVAILABLE',
        message: 'Immerli learning service unavailable.',
        statusCode: 503,
      } satisfies ApiError;
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An error occurred',
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  async getLessons(token: string, profileId: string, level?: string) {
    const params = new URLSearchParams({ profileId });
    if (level) params.append('level', level);

    return this.request<any[]>(`/lessons?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createLesson(
    token: string,
    data: { profileId: string; title: string; content: string; type: string; level: string; sourceUrl?: string }
  ) {
    return this.request<any>('/lessons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async getVocab(token: string, status?: number) {
    const params = status !== undefined ? `?status=${status}` : '';
    return this.request<any[]>(`/vocab${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createVocab(token: string, data: any) {
    return this.request<any>('/vocab', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async updateVocabStatus(token: string, id: string, status: number) {
    return this.request<any>(`/vocab/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
