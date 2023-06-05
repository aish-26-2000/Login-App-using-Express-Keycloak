# Login App using Express and Keycloak

This is a sample login application that demonstrates how to integrate Keycloak, an open-source identity and access management solution, with an Express.js web application for user authentication and authorization.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aish-26-2000/Login-App-using-Express-Keycloak.git
   ```

2. Install the dependencies:

   ```bash
   cd Login-App-using-Express-Keycloak
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory of the project and provide the following variables:

   ```plaintext
   ISSUER_URL=<Keycloak issuer URL>
   CLIENT_ID=<Keycloak client ID>
   CLIENT_SECRET=<Keycloak client secret>
   REDIRECT_URI=<Redirect URI for authentication callback>
   POST_LOGOUT_REDIRECT_URI=<Redirect URI after logout>
   ```

4. Start the application:

   ```bash
   npm start
   ```

   The application will be running at `http://localhost:3000`.

## Usage

1. Open a web browser and navigate to `http://localhost:3000`.

2. You will be redirected to the Keycloak authentication page.

3. Log in using your Keycloak credentials.

4. After successful authentication, you will be redirected back to the application and can access the protected routes.

5. You can access the following routes:

   - `/testauth` - A protected route that requires authentication.
   - `/other` - Another protected route that requires authentication.
   - `/` - An unprotected route.

6. To log out, click on the "Logout" link or access `/logout`. You will be logged out and redirected to the home page.
