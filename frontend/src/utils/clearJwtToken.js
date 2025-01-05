export const clearJwtToken = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  export const getJwtToken = () => {
    const match = document.cookie.match('(^|;)\\s*token\\s*=\\s*([^;]+)');
    return match ? match[2] : null;
  };