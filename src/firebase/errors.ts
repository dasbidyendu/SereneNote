export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
  userId?: string | null;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  public readonly firestoreError: string;

  constructor(context: SecurityRuleContext) {
    const firestoreError = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify({
      context: {
        request: {
          method: context.operation,
          path: `/databases/(default)/documents/${context.path}`,
          resource: {
            data: context.requestResourceData,
          }
        },
        // In a real scenario, you would populate this with the actual auth state
        // This is a placeholder to show the structure.
        auth: {
          uid: context.userId || 'No user authenticated',
          token: {
            /* decoded token claims */
          },
        },
      },
    }, null, 2)}`;

    super(firestoreError);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.firestoreError = firestoreError;
    
    // This is to make the error message more readable in the console
    this.stack = '';
  }

  toString() {
    return this.firestoreError;
  }
}
