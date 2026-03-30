import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { EventStoreProvider } from './context/EventStore'
import { initNative } from './lib/native'
import App from './App.jsx'

// Initialize native Capacitor plugins (no-op on web)
initNative();

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
