import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar, Chip, Paper, IconButton, Divider } from '@mui/material';
import { Send, SmartToy, Person, DeleteOutline, ContentCopy, AutoAwesome } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const SUGGESTIONS = [
  'Explain the 4-plate BAMP protocol & elastics force',
  'What is the clinical significance of CVM 3 stage?',
  'What are normal ANB and Wits appraisal values?',
  'How do I interpret the SHAP feature importance plot?',
  'What are the 11 anatomical cephalometric landmarks?'
];

export const AIChatPage = () => {
  const { showNotification } = useNotification();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Dr. Practitioner! I am your **AI Clinical Orthodontic Assistant**. You have unlimited access to chat with me. Ask me anything about BAMP protocols, cephalometric angles, patient growth stages, or diagnostic guidelines!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        prompt: textToSend,
        history: messages.slice(-6)
      });

      const aiReply = res.data?.reply || 'I am ready to assist with any clinical orthodontic query!';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Thank you for your question. BAMP (Bone-Anchored Maxillary Protraction) is indicated for Class III skeletal malocclusions in growing patients (CVM 2-3). It provides 2.5mm to 4.5mm maxillary protraction using 150g-250g intermaxillary elastics.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Chat history cleared. How else can I assist your clinical analysis today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showNotification('Chatboard reset', 'info');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Response copied to clipboard', 'success');
  };

  return (
    <Box>
      <Header
        title="AI Clinical Assistant Chatboard"
        subtitle="Unlimited interactive AI chat assistant for orthodontic treatment planning, cephalometrics, BAMP protocols, and clinical queries."
      />

      {/* Suggestion Chips */}
      <Box mb={2} display="flex" gap={1} flexWrap="wrap" alignItems="center">
        <Typography variant="caption" fontWeight={700} color="text.secondary" mr={1}>
          Quick Prompt Suggestions:
        </Typography>
        {SUGGESTIONS.map((s, idx) => (
          <Chip
            key={idx}
            label={s}
            onClick={() => handleSend(s)}
            icon={<AutoAwesome fontSize="small" />}
            clickable
            size="small"
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '12px' }}
          />
        ))}
      </Box>

      {/* Main Chat Container */}
      <Card sx={{ borderRadius: '20px', height: '620px', display: 'flex', flexDirection: 'column' }}>
        {/* Header Bar */}
        <Box px={3} py={1.8} display="flex" justifyContent="space-between" alignItems="center" bgcolor="primary.main" color="#fff">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                AI Clinical Knowledge Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Unlimited Messages • Always Active
              </Typography>
            </Box>
          </Box>
          <IconButton color="inherit" onClick={handleClearChat} title="Clear Chat History">
            <DeleteOutline />
          </IconButton>
        </Box>

        {/* Message Log */}
        <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#0b0f19' }}>
          {messages.map((msg, index) => {
            const isAI = msg.sender === 'ai';
            return (
              <Box
                key={index}
                display="flex"
                flexDirection={isAI ? 'row' : 'row-reverse'}
                gap={1.5}
                mb={2.5}
                alignItems="flex-start"
              >
                <Avatar sx={{ bgcolor: isAI ? 'secondary.main' : 'primary.main', width: 36, height: 36 }}>
                  {isAI ? <SmartToy fontSize="small" /> : <Person fontSize="small" />}
                </Avatar>

                <Box maxWidth="75%">
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                      bgcolor: isAI ? '#1e293b' : '#0f52ba',
                      color: '#ffffff'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {msg.text}
                    </Typography>
                  </Paper>
                  <Box display="flex" justifyContent={isAI ? 'flex-start' : 'flex-end'} alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="caption" sx={{ color: 'gray', fontSize: '10px' }}>
                      {msg.timestamp}
                    </Typography>
                    {isAI && (
                      <IconButton size="small" onClick={() => handleCopy(msg.text)} sx={{ color: 'gray', p: 0.2 }}>
                        <ContentCopy sx={{ fontSize: 13 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {loading && (
            <Box display="flex" gap={1.5} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                <SmartToy fontSize="small" />
              </Avatar>
              <Paper sx={{ p: 2, borderRadius: '18px 18px 18px 4px', bgcolor: '#1e293b', color: '#fff' }}>
                <Typography variant="body2" color="secondary" sx={{ fontStyle: 'italic' }}>
                  AI is formulating clinical response...
                </Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <Divider />

        {/* Input Bar */}
        <Box p={2} bgcolor="#0f172a" component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }} display="flex" gap={1.5} alignItems="center">
          <TextField
            fullWidth
            placeholder="Ask any question about BAMP, cephalometrics, CVM growth, or treatment protocols..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            size="small"
            sx={{
              bgcolor: '#1e293b',
              borderRadius: '12px',
              input: { color: '#ffffff' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !inputPrompt.trim()}
            endIcon={<Send />}
            sx={{ borderRadius: '12px', px: 3 }}
          >
            Send
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
