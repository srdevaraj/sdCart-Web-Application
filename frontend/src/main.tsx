import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { Providers } from '@/app/providers'
import { router } from '@/app/router'
import { RootErrorBoundary } from '@/components/common/error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </RootErrorBoundary>
  </StrictMode>,
)
