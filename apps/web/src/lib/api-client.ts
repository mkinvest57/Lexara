const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  message: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An error occurred',
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  // Auth
  async signup(data: { email: string; password: string; name?: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Language Profile
  async getLanguageProfile(token: string) {
    return this.request<any>('/language-profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createLanguageProfile(token: string, data: any) {
    return this.request<any>('/language-profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  // Lessons
  async getLessons(token: string, profileId: string, level?: string) {
    const params = new URLSearchParams({ profileId });
    if (level) params.append('level', level);

    return this.request<any[]>(`/lessons?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getLesson(token: string, id: string) {
    return this.request<any>(`/lessons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Vocabulary
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

  async translate(token: string, text: string, targetLang: string, context?: string) {
    return this.request<{ translatedText: string }>('/vocab/translate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, targetLang, context }),
    });
  }

  // SRS
  async getDueCards(token: string, limit: number = 20) {
    return this.request<any[]>(`/srs/due?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async submitReview(token: string, srsItemId: string, correct: boolean) {
    return this.request<any>('/srs/review', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ srsItemId, correct }),
    });
  }

  async startSession(token: string, itemsCount: number, type: string = 'flashcard') {
    return this.request<any>('/srs/session/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemsCount, type }),
    });
  }

  async endSession(token: string, sessionId: string, correctCount: number) {
    return this.request<any>(`/srs/session/${sessionId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ correctCount }),
    });
  }

  // Stats
  async getTodayStats(token: string) {
    return this.request<any>('/stats/today', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getOverviewStats(token: string) {
    return this.request<any>('/stats/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async logReading(token: string, language: string, wordsRead: number, minutes: number = 0) {
    return this.request<any>('/stats/log/reading', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ language, wordsRead, minutes }),
    });
  }

  async logReview(token: string, language: string, cardsCount: number) {
    return this.request<any>('/stats/log/review', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ language, cardsCount }),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
