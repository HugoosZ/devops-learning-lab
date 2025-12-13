# My Auth API

This is a simple authentication API built using Node.js and Express. It allows users to log in using predefined credentials stored in a JSON file.

## Project Structure

```
my-auth-api
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers
│   │   └── auth.controller.ts # Handles authentication logic
│   ├── routes
│   │   └── auth.routes.ts     # Defines authentication routes
│   ├── services
│   │   └── auth.service.ts     # Contains methods for credential validation
│   └── types
│       └── index.ts           # Defines request and response types
├── data
│   └── credentials.json       # Stores user credentials
├── package.json               # NPM package configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd my-auth-api
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

## Usage

To log in, send a POST request to `/api/login` with the following JSON body:

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username": "testuser", "password": "testpass"}'
```

## License

This project is licensed under the MIT License.