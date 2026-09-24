import axiosInstance, { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../api/axiosInstance';

export const authService = {
  /**
   * Log in user with username & password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(username, password) {
    const response = await axiosInstance.post('/auth/login', {
      username: username.trim(),
      password,
      expiresInMins: 120,
    });

    const data = response.data;
    const token = data.accessToken || data.token;
    const user = {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      image: data.image,
    };

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    return { user, token };
  },

  /**
   * Get stored current user
   */
  getStoredUser() {
    try {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get stored token
   */
  getStoredToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Log out user and clear storage
   */
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
