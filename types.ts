export interface ApiNodeConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers: string; // JSON string
  body: string;    // JSON string or template string
  position: { x: number; y: number };
}

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface ExecutionResult {
  stepId: string;
  stepName: string;
  status: 'success' | 'error';
  data: any;
  error?: string;
  duration: number; // in ms
}
