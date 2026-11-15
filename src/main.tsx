import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/css/globals.css'
import './config/i18n'
import App from './App.tsx'
import Spinner from './views/spinner/Spinner.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './shared/api/queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<Spinner />}>
      <App />
    </Suspense>
  </QueryClientProvider>
)
