# Afriton Platform

Afriton is a comprehensive platform designed to provide seamless cross-border transactions and efficient user management. This repository contains the source code for both the frontend and backend components of the Afriton platform. Each component has its own dedicated directory and README file for detailed setup and usage instructions.

## Table of Contents

- [Overview](#overview)
- [Frontend](#frontend)
- [Backend](#backend)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Overview

Afriton facilitates the following key functionalities:

1. Secure and efficient user authentication.
2. Real-time cross-border transaction processing.
3. Responsive user interfaces for admins, agents, and normal users.
4. Reliable backend services built with modern web technologies.

The project is divided into two main parts:

- **Frontend**: Built with React and Tailwind CSS.
- **Backend**: Built with FastAPI and SQLAlchemy.

Each component is designed to be modular and can be developed or deployed independently.

## Frontend

The frontend is located in the `client/afriton` directory. It is responsible for rendering the user interface and handling client-side logic. Key features include:

- Dynamic dashboards for admins, agents, and users.
- Responsive design using Tailwind CSS.
- Integration with backend APIs for seamless user experiences.

Refer to the [Frontend README](client/afriton/README.md) for detailed setup and usage instructions.

## Backend

The backend is located in the `server/users_micro` directory. It provides the API services and database management necessary for the platform. Key features include:

- User authentication with JWT.
- Database management using SQLAlchemy.
- Modular endpoints for scalability.

Refer to the [Backend README](server/users_micro/README.md) for detailed setup and usage instructions.

## Getting Started

To set up the project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/lscblack/afriton.git
cd afriton
```

### 2. Set Up the Frontend

Navigate to the frontend directory and follow its setup instructions:

```bash
cd client/afriton
pnpm install
pnpm dev
```

### 3. Set Up the Backend

Navigate to the backend directory and follow its setup instructions:

```bash
cd server/users_micro
python3 -m venv venv
source venv/bin/activate  # For Linux/MacOS
# or
venv\Scripts\activate  # For Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Environment Configuration

Ensure the `.env` files in both the frontend and backend directories are configured with the necessary credentials and secrets.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

