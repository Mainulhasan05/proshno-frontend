'use client';

import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#F8FAFC' },
          },
          error: {
            iconTheme: { primary: '#F43F5E', secondary: '#F8FAFC' },
          },
        }}
      />
    </Provider>
  );
}
