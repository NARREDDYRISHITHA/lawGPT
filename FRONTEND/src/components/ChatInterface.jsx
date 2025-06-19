import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import ListIcon from '@mui/icons-material/List';
import CompareIcon from '@mui/icons-material/Compare';
import HelpIcon from '@mui/icons-material/Help';
import BookIcon from '@mui/icons-material/Book';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';

// Styled Components
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.grey[400],
    },
  },
}));

const MessageBubble = styled(Paper)(({ theme, type }) => ({
  padding: theme.spacing(2),
  maxWidth: '80%',
  borderRadius: theme.spacing(2),
  backgroundColor: type === 'user' ? theme.palette.primary.main : theme.palette.background.paper,
  color: type === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: type === 'user' ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[2]
}));

const SectionCard = styled(motion.div)(({ theme, type }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  borderRadius: '12px',
  background: getCardBackground(type),
  border: `1px solid ${getCardBorderColor(type)}`,
  boxShadow: theme.shadows[3],
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: getCardBorderColor(type),
  },
}));

const SectionTitle = styled(Typography)(({ theme, type }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  color: getTitleColor(type),
  fontWeight: 600,
  fontSize: '1.2rem',
}));

const SectionContent = styled(Typography)(({ theme, type }) => ({
  color: getContentColor(type),
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  '& ul': {
    margin: 0,
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2]
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2)
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none'
}));

// Helper functions for styling
function getCardBackground(type) {
  const gradients = {
    summary: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
    list: 'linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%)',
    comparison: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
    explanation: 'linear-gradient(135deg, #f0fff4 0%, #e6ffe9 100%)',
    definition: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
    case_ruling: 'linear-gradient(135deg, #fff8f0 0%, #ffe6d6 100%)',
    legal_reference: 'linear-gradient(135deg, #f8f0ff 0%, #e6d6ff 100%)',
    court_composition: 'linear-gradient(135deg, #f0fff8 0%, #d6ffe6 100%)',
    general: 'linear-gradient(135deg, #f5f5f5 0%, #e6e6e6 100%)',
    error: 'linear-gradient(135deg, #fff0f0 0%, #ffe6e6 100%)',
  };
  return gradients[type] || gradients.general;
}

function getCardBorderColor(type) {
  const colors = {
    summary: '#4a90e2',
    list: '#6c5ce7',
    comparison: '#e74c3c',
    explanation: '#2ecc71',
    definition: '#3498db',
    case_ruling: '#f39c12',
    legal_reference: '#9b59b6',
    court_composition: '#1abc9c',
    general: '#95a5a6',
    error: '#e74c3c',
  };
  return colors[type] || colors.general;
}

function getTitleColor(type) {
  const colors = {
    summary: '#2c3e50',
    list: '#2c3e50',
    comparison: '#c0392b',
    explanation: '#27ae60',
    definition: '#2980b9',
    case_ruling: '#d35400',
    legal_reference: '#8e44ad',
    court_composition: '#16a085',
    general: '#2c3e50',
    error: '#c0392b',
  };
  return colors[type] || colors.general;
}

function getContentColor(type) {
  return '#2c3e50';
}

function getIconForType(type) {
  const icons = {
    summary: <DescriptionIcon />,
    list: <ListIcon />,
    comparison: <CompareIcon />,
    explanation: <HelpIcon />,
    definition: <BookIcon />,
    case_ruling: <GavelIcon />,
    legal_reference: <BookIcon />,
    court_composition: <AccountBalanceIcon />,
    general: <InfoIcon />,
    error: <InfoIcon />,
  };
  return icons[type] || icons.general;
}

function getTitleForType(type) {
  const titles = {
    summary: 'Summary',
    list: 'List',
    comparison: 'Comparison',
    explanation: 'Explanation',
    definition: 'Definition',
    case_ruling: 'Case Ruling',
    legal_reference: 'Legal Reference',
    court_composition: 'Court Information',
    general: 'Information',
    error: 'Error',
  };
  return titles[type] || titles.general;
}

// Legal Response Card Components
const LegalCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[3],
  border: `1px solid ${theme.palette.primary.main}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4CAF50, #2196F3)'
  }
}));

const ConclusionCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[2]
}));

// Chat Interface Component
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { type: 'error', content: data.error }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: data.response,
          isLegal: data.response.includes('Legal Section') || 
                  data.response.includes('Legal Analysis') ||
                  data.response.includes('Legal Implications')
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'An error occurred while sending the message.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        setMessages(prev => [...prev, { type: 'error', content: data.error }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'system', 
          content: 'File uploaded successfully. You can now ask questions about it.' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'An error occurred while uploading the file.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderLegalResponse = (content) => {
    const sections = content.split('══════════════════════════════════════════════════════════');
    return (
      <AnimatePresence>
        {sections.map((section, index) => {
          if (!section.trim()) return null;
          
          const lines = section.trim().split('\n');
          const title = lines[0];
          const content = lines.slice(1).join('\n');

          if (title.includes('Conclusion')) {
            return (
              <ConclusionCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <SectionTitle variant="h6">
                  {title}
                </SectionTitle>
                <SectionContent>
                  {content}
                </SectionContent>
              </ConclusionCard>
            );
          }

          return (
            <LegalCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <SectionTitle variant="h6">
                {title}
              </SectionTitle>
              <SectionContent>
                {content}
              </SectionContent>
            </LegalCard>
          );
        })}
      </AnimatePresence>
    );
  };

  const renderMessage = (message, index) => {
    if (message.type === 'user') {
      return (
        <MessageBubble
          key={index}
          type="user"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Typography>{message.content}</Typography>
        </MessageBubble>
      );
    }

    if (message.type === 'error') {
      return (
        <MessageBubble
          key={index}
          type="error"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ backgroundColor: 'error.main', color: 'error.contrastText' }}
        >
          <Typography>{message.content}</Typography>
        </MessageBubble>
      );
    }

    if (message.type === 'system') {
      return (
        <MessageBubble
          key={index}
          type="system"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ backgroundColor: 'info.main', color: 'info.contrastText' }}
        >
          <Typography>{message.content}</Typography>
        </MessageBubble>
      );
    }

    if (message.isLegal) {
      return (
        <Box key={index} sx={{ width: '100%' }}>
          {renderLegalResponse(message.content)}
        </Box>
      );
    }

    return (
      <MessageBubble
        key={index}
        type="assistant"
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Typography>{message.content}</Typography>
      </MessageBubble>
    );
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((message, index) => renderMessage(message, index))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx"
        />
        <Tooltip title="Upload Document">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            color="primary"
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        <StyledTextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          variant="outlined"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleSend}
          endIcon={<SendIcon />}
          disabled={loading}
        >
          Send
        </StyledButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface; 