const BASE_URL = '/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  // For FormData (uploads), we must let the browser set the boundary
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      const error = new Error(data.message || 'Something went wrong');
      error.response = { data, status: response.status };
      throw error;
    }

    // Wrap in data property to match axios response structure
    return { data };
  } catch (error) {
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
};

// Video APIs
export const videoAPI = {
  upload: (formData) =>
    request('/videos', {
      method: 'POST',
      body: formData,
    }),
  getAll: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/videos${query}`);
  },
  getOne: (id) => request(`/videos/${id}`),
  getMyVideos: () => request('/videos/teacher/my-videos'),
  delete: (id) => request(`/videos/${id}`, { method: 'DELETE' }),
  getCaptions: (id) => request(`/videos/${id}/captions`),
  generateCaptions: (id, provider = 'auto') =>
    request(`/videos/${id}/generate-captions`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),
  updateSignInterpreter: (id, data) =>
    request(`/videos/${id}/sign-interpreter`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadSignInterpreter: (id, file) => {
    const data = new FormData();
    data.append('interpreter', file);
    return request(`/videos/${id}/sign-interpreter/upload`, { method: 'PUT', body: data });
  },
  getStreamUrl: (id) => {
    const token = localStorage.getItem('authToken');
    return `/api/videos/stream/${id}?token=${token}`;
  },
  getSignInterpreterStreamUrl: (id) => {
    const token = localStorage.getItem('authToken');
    return `/api/videos/${id}/sign-interpreter/stream?token=${token}`;
  },
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data) => request('/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getForVideo: (videoId) => request(`/feedback/video/${videoId}`),
  getMyFeedback: () => request('/feedback/my-feedback'),
};

// AI APIs
export const aiAPI = {
  getInsights: (videoId) => request(`/ai/insights/${videoId}`),
  getTeacherSummary: () => request('/ai/teacher-summary'),
};

export default request;
