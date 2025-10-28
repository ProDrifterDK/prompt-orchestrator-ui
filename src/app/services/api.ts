import { GenerationRequest, GenerationResponse } from '../interfaces/types';

export const generateMessages = async (requestBody: GenerationRequest): Promise<GenerationResponse> => {
  const res = await fetch('http://127.0.0.1:8000/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'An unknown error occurred.');
  }

  const data: GenerationResponse = await res.json();
  return data;
};