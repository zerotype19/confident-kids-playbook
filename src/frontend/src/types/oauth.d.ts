interface Window {
  gapi: {
    auth2: {
      getAuthInstance(): Promise<{
        signIn(): Promise<{
          getAuthResponse(): {
            id_token: string;
          };
        }>;
      }>;
    };
  };
  AppleID: {
    auth: {
      signIn(): Promise<{
        identityToken: string;
      }>;
    };
  };
} 