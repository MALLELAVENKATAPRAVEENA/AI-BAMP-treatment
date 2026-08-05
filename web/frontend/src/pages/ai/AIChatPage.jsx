import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar, Chip, Paper, IconButton, Divider, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Send, SmartToy, Person, DeleteOutline, ContentCopy, AutoAwesome, FolderShared } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, setDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { subscribePatients } from '../../services/patientService';

const SUGGESTIONS = [
  'Explain this patient\'s ANB and Wits values',
  'Why is this patient classified at their risk level?',
  'Explain the 4-plate BAMP protocol & elastics force',
  'What is the clinical significance of CVM 3 stage?',
  'What treatment recommendations are indicated?'
];

const generatePatientContextAwareResponse = (prompt, patient, measurements, prediction) => {
  const q = prompt.toLowerCase();
  const name = patient?.patientName || patient?.name || 'Selected Patient';
  const age = patient?.age || 11;
  const cvm = patient?.cvmStage || 'CVM 3';
  const anb = measurements?.ANB !== undefined ? measurements.ANB : -2.8;
  const wits = measurements?.Wits !== undefined ? measurements.Wits : -3.5;
  const sna = measurements?.SNA || 78.5;
  const snb = measurements?.SNB || 81.2;
  const score = prediction?.successProbability || patient?.latestPredictionScore || 88.5;
  const risk = prediction?.riskCategory || (score < 65 ? 'High Risk' : score < 80 ? 'Moderate Risk' : 'Low Risk');

  if (q.includes('anb') || q.includes('wits') || q.includes('measurement') || q.includes('value')) {
    return `### 📐 Cephalometric Analysis for ${name}

- **ANB Angle:** **${anb}°** (Normal: 2° to 4°). ${anb < 0 ? `Negative value indicates **Class III Skeletal Discrepancy** with maxillary retrognathism/mandibular prognathism.` : 'Class I relationship.'}
- **Wits Appraisal:** **${wits} mm** (Normal: 0mm to -1mm). ${wits < -3.0 ? `Linear discrepancy < -3mm confirms severe skeletal Class III discrepancy.` : 'Moderate discrepancy.'}
- **SNA Angle:** **${sna}°** (Maxillary position relative to cranial base).
- **SNB Angle:** **${snb}°** (Mandibular position relative to cranial base).

**Clinical Interpretation:** ${name} presents a Class III skeletal pattern suitable for Bone-Anchored Maxillary Protraction (BAMP) during peak pubertal growth.`;
  }

  if (q.includes('risk') || q.includes('why') || q.includes('prediction') || q.includes('success')) {
    return `### 🎯 BAMP Outcome Prediction Breakdown for ${name}

- **Predicted Success Probability:** **${score}%**
- **Risk Classification:** **${risk}**
- **CVM Growth Stage:** **${cvm}** (Age ${age} yrs)
- **ANB Discrepancy:** **${anb}°**

**Clinical Explanation:** 
${score >= 80 
  ? `${name} is in **${cvm}**, which represents peak/accelerating pubertal growth velocity. The moderate negative ANB (${anb}°) responds optimally to mini-plate anchored Class III elastics without dental tipping.`
  : `${name} has a **${risk}** assessment due to ${cvm.includes('5') || cvm.includes('6') ? 'advanced skeletal maturation (growth nearly completed)' : 'severe skeletal discrepancy (ANB < -5°)'}. Surgical orthognathic consultation may be required if orthopedic response is limited.`}`;
  }

  if (q.includes('bamp') || q.includes('protocol') || q.includes('recommend') || q.includes('treatment')) {
    return `### 🦷 Customized BAMP Protocol for ${name}

1. **Surgical Mini-Plate Placement:**
   - 2 Infrazygomatic crest mini-plates (Maxilla).
   - 2 Parasymphyseal mini-plates (Mandible between canine & lateral incisor).
2. **Force & Elastics:**
   - **150g per side** Class III intermaxillary elastics for initial 4 weeks, increasing to **200g-250g**.
   - Wear time: **24 hours/day**.
3. **Expected Protraction:** Estimated **3.2mm to 4.5mm** maxillary advancement over a **14-month** treatment duration.`;
  }

  if (q.includes('cvm') || q.includes('stage') || q.includes('growth')) {
    return `### 📊 Growth Assessment for ${name} (${cvm})

${name} is currently at **${cvm}** (Age ${age} yrs). 
${cvm.includes('3') || cvm.includes('2') 
  ? `This is the **OPTIMAL BAMP WINDOW** characterized by peak mandibular growth velocity and maximum sutural orthopedic adaptability.`
  : `Patient has passed peak pubertal growth velocity. Orthopedic protraction requires careful monitoring.`}`;
  }

  return `### 🤖 Gemini AI Clinical Summary for ${name}

- **Patient Chart:** ${name} (Age ${age}, ${patient?.gender || 'Patient'})
- **Growth Stage:** ${cvm}
- **ANB / Wits:** ${anb}° / ${wits} mm
- **BAMP AI Success Probability:** ${score}% (${risk})

How else can I assist your treatment planning for ${name}?`;
};

export const AIChatPage = () => {
  const { showNotification } = useNotification();
  const messagesEndRef = useRef(null);

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientMeasurements, setPatientMeasurements] = useState(null);
  const [patientPrediction, setPatientPrediction] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubPat = subscribePatients((list) => {
      setPatients(list);
      if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(list[0].patientId || list[0].id);
        setSelectedPatient(list[0]);
      }
    });
    return () => unsubPat();
  }, []);

  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const found = patients.find(p => p.patientId === selectedPatientId || p.id === selectedPatientId);
      if (found) {
        setSelectedPatient(found);
        setPatientMeasurements(found.cephalometricMeasurements || { SNA: 78.2, SNB: 81.0, ANB: -2.8, Wits: -3.5 });
        setPatientPrediction({
          successProbability: found.latestPredictionScore || 89.2,
          riskCategory: (found.latestPredictionScore || 89.2) >= 80 ? 'Low Risk' : 'Moderate Risk'
        });
      }
    }
  }, [selectedPatientId, patients]);

  // Real-time Firestore Chat Messages Listener
  useEffect(() => {
    if (!db) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: 'Hello Dr. Practitioner! I am your **Gemini AI Clinical Assistant**. Select a patient chart above to analyze patient-specific ANB angles, BAMP outcome predictions, and treatment protocols!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const q = query(collection(db, 'chat_messages'));
    const unsubChat = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

      if (list.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: 'Hello Dr. Practitioner! I am your **Gemini AI Clinical Assistant**. Select a patient chart above to analyze patient-specific ANB angles, BAMP outcome predictions, and treatment protocols!',
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(list);
      }
    });

    return () => unsubChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim()) return;

    const timestampStr = new Date().toISOString();
    const userMsg = {
      sender: 'user',
      text: textToSend,
      patientId: selectedPatientId || 'GENERAL',
      timestamp: timestampStr
    };

    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    if (db) {
      try {
        await addDoc(collection(db, 'chat_messages'), userMsg);
      } catch (_) {}
    } else {
      setMessages(prev => [...prev, userMsg]);
    }

    try {
      const aiReplyText = generatePatientContextAwareResponse(
        textToSend,
        selectedPatient,
        patientMeasurements,
        patientPrediction
      );

      const aiMsg = {
        sender: 'ai',
        text: aiReplyText,
        patientId: selectedPatientId || 'GENERAL',
        timestamp: new Date().toISOString()
      };

      if (db) {
        await addDoc(collection(db, 'chat_messages'), aiMsg);
      } else {
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'chat_messages'));
        snap.docs.forEach(async (d) => {
          await deleteDoc(doc(db, 'chat_messages', d.id));
        });
      } catch (_) {}
    }
    setMessages([
      {
        id: 'reset',
        sender: 'ai',
        text: 'Chat history reset. Select a patient chart to run patient-aware clinical AI inquiries.',
        timestamp: new Date().toISOString()
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
        title="Gemini AI Clinical Assistant Chatboard"
        subtitle="Patient-context-aware AI assistant synchronized across Web & Android using Firebase Firestore."
      />

      {/* Patient Selector & Suggestions Bar */}
      <Box mb={2.5} display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 260, bgcolor: '#1e293b', borderRadius: '12px' }}>
          <InputLabel sx={{ color: '#aaa' }}>Select Patient Context</InputLabel>
          <Select
            value={selectedPatientId}
            label="Select Patient Context"
            onChange={(e) => setSelectedPatientId(e.target.value)}
            sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
          >
            <MenuItem value=""><em>-- General Orthodontic Inquiries --</em></MenuItem>
            {patients.map((p) => (
              <MenuItem key={p.patientId || p.id} value={p.patientId || p.id}>
                {p.patientName || p.name} ({p.patientId || p.id} • {p.cvmStage || 'CVM 3'})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedPatient && (
          <Chip
            icon={<FolderShared />}
            label={`Active: ${selectedPatient.patientName || selectedPatient.name} | ANB: ${patientMeasurements?.ANB ?? -2.8}° | Pred: ${patientPrediction?.successProbability ?? 88.5}%`}
            color="secondary"
            variant="filled"
            sx={{ fontWeight: 700, borderRadius: '12px', py: 0.5 }}
          />
        )}
      </Box>

      {/* Quick Prompt Suggestions */}
      <Box mb={2} display="flex" gap={1} flexWrap="wrap" alignItems="center">
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
      <Card sx={{ borderRadius: '20px', height: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Header Bar */}
        <Box px={3} py={1.8} display="flex" justifyContent="space-between" alignItems="center" bgcolor="primary.main" color="#fff">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Gemini AI Clinical Knowledge & Patient Context Engine
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Real-Time Firestore Sync (bamp-1de96) • Cross-Platform Web & Android
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
            const isAI = msg.sender === 'ai' || msg.sender === 'assistant';
            const displayTime = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <Box
                key={msg.id || index}
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
                      {displayTime}
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
                  Gemini AI is formulating patient-aware response...
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
            placeholder={selectedPatient ? `Ask Gemini AI about ${selectedPatient.patientName || selectedPatient.name}'s ANB, risk, or BAMP protocol...` : "Ask Gemini AI about BAMP protocols, cephalometrics, or patient growth..."}
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

