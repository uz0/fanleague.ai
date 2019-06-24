import decode from 'jwt-decode';

export default class AuthService {
  constructor() {
    this.tokenName = 'JWS_TOKEN';
  }

  oauthLogin = async (email, name, photo) => {
    const response = await fetch('/api/authentication/oauth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        photo,
      }),
    });

    const result = await response.json();

    this.setToken(result.token); // Setting the token in localStorage

    return result;
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem(this.tokenName);
  }

  getProfile() {
    // Using jwt-decode npm package to decode the token
    return decode(this.getToken());
  }

  isLoggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken(); // GEtting token from localstorage
    return Boolean(token) && !this.isTokenExpired(token); // Handwaiving here
  }

  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      return decoded.exp < Date.now() / 1000; // Checking if token is expired
    } catch (error) {
      return false;
    }
  }

  setToken(idToken) {
    // Saves user token to localStorage
    localStorage.setItem(this.tokenName, idToken);
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem(this.tokenName);
  }
}