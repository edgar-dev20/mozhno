import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}