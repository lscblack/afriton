
# Afriton Client

Afriton is a web application for managing transactions and user accounts. This project is built using **React** and **Vite**, styled with **Tailwind CSS**, and uses **pnpm** for package management.

---

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/lscblack/afriton.git
cd afriton/client/afriton
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm dev
```

Your app will be live at `http://localhost:5173`.

### 4. Build the Project for Production

```bash
pnpm build
```

---

## Environment Variables

Create a `.env` file in your frontend directory and include the following variables:

```env
VITE_API_URL = "<YOUR_LOCAL_API_URL>"

# Uncomment and replace for production
# VITE_API_URL = "<YOUR_PRODUCTION_API_URL>"

# Frontend credentials
VITE_AFRITON_FRONT_USERNAME = "<YOUR_FRONTEND_USERNAME>"
VITE_AFRITON_FRONT_PASSWORD = "<YOUR_FRONTEND_PASSWORD>"

# Google Auth credentials
VITE_GOOGLE_AUTH_CLIENT_ID = "<YOUR_GOOGLE_AUTH_CLIENT_ID>"
VITE_GOOGLE_AUTH_CLIENT_SECRET = "<YOUR_GOOGLE_AUTH_CLIENT_SECRET>"

# Secret keys
SECRET_KEY = "<YOUR_SECRET_KEY>"
SECRET_KEY_DATA = "<YOUR_SECRET_KEY_DATA>"
ALGORITHM_DATA = "<YOUR_ALGORITHM_DATA>"
ALGORITHM = "<YOUR_ALGORITHM>"
```

---

## Project Structure

The project is organized as follows:

```
afriton/client/afriton/
├── public/                # Public static files
├── src/                   # Source code
│   ├── assets/            # Static assets like images
│   ├── components/        # Reusable components
│   ├── DashComp/          # Dashboard components
│   │   ├── admin/         # Admin-specific components
│   │   ├── citizine/      # Citizen-specific components
│   │   ├── controllers/   # Controller components
│   │   └── sharedComps/   # Shared components
│   ├── pages/             # Page components
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Project dependencies and scripts
```

---

## Available Scripts

- **`pnpm dev`** - Starts the development server at `http://localhost:5173`.
- **`pnpm build`** - Builds the project for production.
- **`pnpm install`** - Installs all the dependencies.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature:  
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:  
   ```bash
   git commit -m 'Add YourFeature'
   ```
4. Push your branch to the remote repository:  
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## Acknowledgments

- [Vite](https://vitejs.dev/) - A fast build tool for modern web projects.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [pnpm](https://pnpm.io/) - A fast and disk space-efficient package manager.

