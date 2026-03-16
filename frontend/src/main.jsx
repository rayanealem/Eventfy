import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { EventStoreProvider } from './context/EventStore'
import App from './App.jsx'
import { StatusBar, Style } from '@capacitor/status-bar'

const setupStatusBar = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0A0A0F' });
  } catch (err) {
    // Ignore error, we're likely in a web browser where StatusBar is not available
  }
};
setupStatusBar();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventStoreProvider>
          <App />
        </EventStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
