'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Grid,
  Box,
} from '@mui/material';

// --- Type Definitions ---
interface GenerationRequest {
  brand_context_path: string;
  channel: string;
  label_reason: {
    label: string;
    reason: string;
  };
  prompt?: string;
  count: number;
}

interface GeneratedMessage {
  text: string;
  channel: string;
  valid: boolean;
}

interface GenerationResponse {
  messages: GeneratedMessage[];
}

// --- Mock Data (as we can't read the backend's file system directly) ---
const brands = [
  { value: 'fullstack-challenge/data/brands/sushi_delight_mx.md', label: 'Sushi Delight MX' },
  { value: 'fullstack-challenge/data/brands/mercadopago_business_ar.md', label: 'MercadoPago Business AR' },
  { value: 'fullstack-challenge/data/brands/vetpro_chile_cl.md', label: 'VetPro Chile CL' },
];

const channels = ['whatsapp', 'push', 'email'];

const labelReasons = [
    { label: "new-user", reason: "welcome" },
    { label: "recurrent-user", reason: "retention" },
    { label: "recurrent-user", reason: "repeat-purchase" },
    { label: "at-risk-user", reason: "re-activate" },
    { label: "churned", reason: "re-activate" },
    { label: "casual", reason: "promote" },
];


export default function HomePage() {
  // --- State Management ---
  const [brand, setBrand] = useState(brands[0].value);
  const [channel, setChannel] = useState(channels[0]);
  const [labelReason, setLabelReason] = useState(labelReasons[0]);
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GenerationResponse | null>(null);

  // --- API Call Handler ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    const requestBody: GenerationRequest = {
      brand_context_path: brand,
      channel,
      label_reason: labelReason,
      prompt: prompt || undefined,
      count,
    };

    try {
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
      setResponse(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- UI Rendering ---
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Prompt Orchestrator UI
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Brand Selector */}
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel id="brand-select-label">Brand</InputLabel>
              <Select
                labelId="brand-select-label"
                value={brand}
                label="Brand"
                onChange={(e) => setBrand(e.target.value)}
              >
                {brands.map((b) => (
                  <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Channel Selector */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
                <InputLabel id="channel-select-label">Channel</InputLabel>
                <Select
                    labelId="channel-select-label"
                    value={channel}
                    label="Channel"
                    onChange={(e) => setChannel(e.target.value)}
                >
                    {channels.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                </Select>
            </FormControl>
          </Grid>
          
          {/* Label/Reason Selector */}
          <Grid size={{ xs: 12, sm: 6 }}>
             <FormControl fullWidth>
                <InputLabel id="label-reason-select-label">Label/Reason</InputLabel>
                <Select
                    labelId="label-reason-select-label"
                    value={`${labelReason.label}-${labelReason.reason}`}
                    label="Label/Reason"
                    onChange={(e) => {
                        const [label, reason] = e.target.value.split('-');
                        const selected = labelReasons.find(lr => lr.label === label && lr.reason === reason);
                        if(selected) setLabelReason(selected);
                    }}
                >
                    {labelReasons.map((lr) => (
                    <MenuItem key={`${lr.label}-${lr.reason}`} value={`${lr.label}-${lr.reason}`}>
                        {`${lr.label} (${lr.reason})`}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
          </Grid>
          
          {/* Operator Prompt */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Optional Operator Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              rows={3}
            />
          </Grid>
          
          {/* Message Count */}
          <Grid size={12}>
             <TextField
               fullWidth
               label="Number of Messages"
               type="number"
               value={count}
               onChange={(e) => setCount(parseInt(e.target.value, 10))}
               InputProps={{ inputProps: { min: 1, max: 5 } }}
             />
          </Grid>
          
          {/* Submit Button */}
          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Messages'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* --- Results Display --- */}
      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      
      {response && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Generated Messages
          </Typography>
          {response.messages.map((msg, index) => (
            <Card key={index} sx={{ mb: 2 }} variant="outlined">
              <CardContent>
                <Typography
                  color={msg.valid ? 'text.primary' : 'text.disabled'}
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                    {msg.text}
                </Typography>
                <Alert severity={msg.valid ? 'success' : 'warning'} sx={{ mt: 1 }}>
                  {`Channel: ${msg.channel} - Validation: ${msg.valid ? 'Passed' : 'Failed'}`}
                </Alert>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
