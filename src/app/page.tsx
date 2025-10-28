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

import { brands, channels, labelReasons, languages } from './constants/data';
import { translations } from './constants/translations';
import { GenerationRequest, GenerationResponse } from './interfaces/types';
import { generateMessages } from './services/api';

export default function HomePage() {
  // --- State Management ---
  const [brand, setBrand] = useState(brands[0].value);
  const [channel, setChannel] = useState(channels[0]);
  const [labelReason, setLabelReason] = useState(labelReasons[0]);
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [language, setLanguage] = useState(languages[0].value);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GenerationResponse | null>(null);

  const t = translations[language as keyof typeof translations];

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
      language,
    };

    try {
      const data = await generateMessages(requestBody);
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
        {t.title}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Language Selector */}
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Brand Selector */}
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel id="brand-select-label">{t.brand}</InputLabel>
              <Select
                labelId="brand-select-label"
                value={brand}
                label={t.brand}
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
              <InputLabel id="channel-select-label">{t.channel}</InputLabel>
              <Select
                labelId="channel-select-label"
                value={channel}
                label={t.channel}
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
              <InputLabel id="label-reason-select-label">{t.labelReason}</InputLabel>
              <Select
                labelId="label-reason-select-label"
                value={`${labelReason.label}-${labelReason.reason}`}
                label={t.labelReason}
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
              label={t.optionalPrompt}
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
              label={t.messageCount}
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
              {loading ? <CircularProgress size={24} /> : t.generateButton}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* --- Results Display --- */}
      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      
      {response && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {t.resultsTitle}
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
                  {`${t.channel}: ${msg.channel} - ${msg.valid ? t.validationPassed : t.validationFailed}`}
                </Alert>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
