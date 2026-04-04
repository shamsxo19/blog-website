# React Appwrite Blog (Megablog)

This is a complete blog website built with React and Appwrite as the backend service. It features authentication, content management, and a rich text editor.

## Features
- **User Authentication:** Sign up, log in, and log out functionality powered by Appwrite.
- **Content Management:** Create, read, update, and delete blog posts.
- **Rich Text Editor:** WYSIWYG editor using TinyMCE for formatting blog posts.
- **File Upload:** Upload featured images for blog posts via Appwrite Storage.
- **State Management:** Redux Toolkit for managing authentication and application state.
- **Routing:** React Router for client-side navigation.
- **Styling:** Tailwind CSS for a responsive and modern user interface.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Appwrite (Authentication, Databases, Storage)
- State Management: Redux Toolkit
- Routing: React Router DOM
- Forms: React Hook Form
- Editor: TinyMCE React

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd megablog
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on `.env.sample` and add your Appwrite module keys:
   ```env
   VITE_APPWRITE_URL="https://cloud.appwrite.io/v1"
   VITE_APPWRITE_PROJECT_ID="your-project-id"
   VITE_APPWRITE_DATABASE_ID="your-database-id"
   VITE_APPWRITE_COLLECTION_ID="your-collection-id"
   VITE_APPWRITE_BUCKET_ID="your-bucket-id"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Production Build
To create a production-ready build, run:
```bash
npm run build
```
