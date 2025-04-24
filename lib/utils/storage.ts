// Keys for localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: "mediaRec_accessToken",
  REFRESH_TOKEN: "mediaRec_refreshToken",
  USER: "mediaRec_user",
};

// Save auth data to localStorage
export const saveAuthToStorage = (
  accessToken: string,
  refreshToken: string,
  user: unknown
) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving auth data to localStorage:", error);
  }
};

// Get auth data from localStorage
export const getAuthFromStorage = () => {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userString = localStorage.getItem(STORAGE_KEYS.USER);

    const user = userString ? JSON.parse(userString) : null;

    return {
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    console.error("Error getting auth data from localStorage:", error);
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }
};

// Clear auth data from localStorage
export const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error("Error clearing auth data from localStorage:", error);
  }
};

// Update access token in localStorage
export const updateAccessTokenInStorage = (accessToken: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  } catch (error) {
    console.error("Error updating access token in localStorage:", error);
  }
};

// Update refresh token in localStorage
export const updateRefreshTokenInStorage = (refreshToken: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } catch (error) {
    console.error("Error updating refresh token in localStorage:", error);
  }
};

// Update user data in localStorage
export const updateUserInStorage = (user: unknown) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error("Error updating user in localStorage:", error);
  }
};
