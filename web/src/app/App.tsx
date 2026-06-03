import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './auth/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}