export interface GenerationRequest {
  brand_context_path: string;
  channel: string;
  label_reason: {
    label: string;
    reason: string;
  };
  prompt?: string;
  count: number;
  language: string;
}

export interface GeneratedMessage {
  text: string;
  channel: string;
  valid: boolean;
}

export interface GenerationResponse {
  messages: GeneratedMessage[];
}