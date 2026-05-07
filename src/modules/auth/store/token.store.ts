const TOKEN_KEY = 'access_token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }
};
