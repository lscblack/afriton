# Afriton Backend 

This is the backend for the Afriton platform, responsible for handling user-related operations such as authentication, registration, and user management.

The backend is built with FastAPI, SQLAlchemy, and Pydantic for data validation. The application is deployed with Uvicorn as the ASGI server.

## Getting Started

To set up the backend locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/lscblack/afriton.git
cd afriton/server/users_micro
```

### 2. Switch to the dev branch

```bash
git checkout dev
```

### 3. Create a virtual environment

For Linux/MacOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

For Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Set up environment variables

Create a `.env` file in the `server/users_micro` directory with the following contents:

```env
SECRET_KEY = "<YOUR_SECRET_KEY>"
SECRET_KEY_DATA = "<YOUR_SECRET_KEY_DATA>"
ALGORITHM_DATA = "<YOUR_ALGORITHM_DATA>"
ALGORITHM = "<YOUR_ALGORITHM>"
DATABASE_URL = "<YOUR_DATABASE_URL>"

# Email credentials
AFRITON_USERNAME = "<YOUR_EMAIL_USERNAME>"
AFRITON_PASSWORD = "<YOUR_EMAIL_APP_PASSWORD>"
AFRITON_SENDER_EMAIL = "<YOUR_SENDER_EMAIL>"

# Frontend credentials
AFRITON_FRONT_USERNAME = "<YOUR_FRONTEND_USERNAME>"
AFRITON_FRONT_PASSWORD = "<YOUR_FRONTEND_PASSWORD>"
```

Replace the placeholders (`<YOUR_SECRET_KEY>`, etc.) with your actual configuration values.

### 6. Run the application

Start the application with Uvicorn:

```bash
uvicorn main:app --reload
```

The backend should now be running at `http://localhost:8000`.

## Project Structure

The backend is organized into the following directories:

```
afriton/server/users_micro/
├── db/                   # Database connection and authentication handling
│   ├── *   # Database connection instance
│   └── *       # Database configuration file
├── endpoints/            # API endpoints
│   └── *         # User-related API endpoints
├── models/               # Database models (tables)
│   ├── *           # User model
│   └── __init__.py       # Imports for models
├── schemas/              # Pydantic schemas for data validation
│   ├── *          # User-related schemas
│   └── __init__.py       # Imports for schemas
├── main.py               # Entry point for FastAPI app
├── requirements.txt      # Project dependencies
└── .env                  # Environment variables (credentials, secrets)
```

## Available Scripts

- `uvicorn main:app --reload` - Starts the FastAPI app in development mode with hot reloading.
- `pip install -r requirements.txt` - Installs all project dependencies.

## Contributing

To contribute to the project, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push your branch to the remote repository (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - A modern, fast (high-performance) web framework for building APIs.
- [SQLAlchemy](https://www.sqlalchemy.org/) - A SQL toolkit and Object-Relational Mapping (ORM) library for Python.
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Data validation and settings management using Python type annotations.
