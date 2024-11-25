# Afriton Client

Afriton is a web application for managing transactions and user accounts. This project is built using React and Vite, with Tailwind CSS for styling and pnpm for package management.

## Getting Started

To get started with the project locally, follow the steps below:

### 1. Clone the repository

```bash
git clone https://github.com/lscblack/afriton.git
cd afriton/client/afriton
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run the development server

```bash
pnpm dev
```

Your app will be live at `http://localhost:5173`.

### 4. Build the project for production

```bash
pnpm build
```

## Project Structure

The project is structured as follows:

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

## Available Scripts

- `pnpm dev` - Starts the development server at `http://localhost:5173`.
- `pnpm build` - Builds the project for production.
- `pnpm install` - Installs all the dependencies.

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

- [Vite](https://vitejs.dev/) - A fast build tool for modern web projects.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [pnpm](https://pnpm.io/) - A fast and disk space-efficient package manager.
