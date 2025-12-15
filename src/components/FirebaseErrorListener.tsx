'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toString());
      
      // In a development environment, we can throw the error to show the Next.js overlay
      if (process.env.NODE_ENV === 'development') {
        // We throw it in a timeout to break out of the event listener's call stack
        // and allow Next.js's error overlay to catch it.
        setTimeout(() => {
          throw error;
        });
      } else {
        // In production, you might want to show a generic toast notification
        // and log the detailed error to a monitoring service.
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You do not have permission to perform this action.',
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
