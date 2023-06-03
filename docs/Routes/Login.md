## Route: /login

This route handles the user login process and returns the necessary data and tokens for authentication.

### Request Method
- POST

### Request Body
- `code` (string): The authorization code received from the frontend.

### Response
- If the login process is successful, the route returns a JSON response with the following structure:
```json
{
  "message": {
    "jwtToken": "JWT token",
    "userData": {
      "twitch_id": "Twitch user ID",
      "twitch_login": "Twitch username",
      "twitch_display": "Twitch display name",
      "email": "User email",
      "twitch_image": "URL of Twitch user's profile image",
      "twitch_view_count": "Total view count on Twitch",
      "twitch_streamer_status": "Streamer status on Twitch",
      "twitch_created_date": "Date of Twitch account creation",
      "twitch_description": "Twitch user description",
      "access_token": "Twitch access token",
      "expiresIn": "Access token expiration time",
      "scope": "Access token scope",
      "aiConfig": "User AI configuration"
    },
    "access_token": "Twitch access token"
  }
}
```

- If the user is new or has not paid, the response will include a `not_paid` status and the user object.

### Frontend Requirements
- The frontend needs to send a POST request to the `/login` endpoint.
- The request body must include the `code` parameter containing the authorization code obtained from the Twitch authentication process.

### Required Dependencies
- express
- ../models/User
- ../models/Twitch
- ../models/Auth
- ../models/AI
- ../models/Berry
- ../db/mongo_config
- ../helpers/consoleLoging

### Usage Example
```javascript
import axios from 'axios';

const login = async (code) => {
  try {
    const response = await axios.post('/login', {
      data: {
        code: code
      }
    });
    console.log(response.data);
    // Handle the response data
  } catch (error) {
    console.error(error);
    // Handle the error
  }
};

// Call the login function with the authorization code
login('your_authorization_code');
```

Note: Make sure to replace `'your_authorization_code'` with the actual authorization code obtained from the Twitch authentication process.