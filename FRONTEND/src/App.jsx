import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGavel, FaPaperPlane, FaLightbulb, FaBalanceScale, FaUserAlt, FaRobot, FaInfoCircle } from 'react-icons/fa';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { BounceLoader } from 'react-spinners';
import TypewriterEffect from 'react-typist-component';
import './App.css';

// Particles background component
const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    window.addEventListener('resize', handleResize);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const numberOfParticles = Math.floor(window.innerWidth * window.innerHeight / 15000);
      
      for (let i = 0; i < numberOfParticles; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
          velocity: {
            x: (Math.random() - 0.5) * 0.4,
            y: (Math.random() - 0.5) * 0.4
          }
        });
      }
    };
    
    initParticles();
    
    // Track mouse movement
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Move particles
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Connect particles near mouse position
        if (mouseRef.current.x && mouseRef.current.y) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance/120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
            
            // Slightly move particles toward mouse
            particle.x += dx * 0.01;
            particle.y += dy * 0.01;
          }
        }
        
        // Connect close particles with lines
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance/100)})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="particles-canvas"
    />
  );
};

function App() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Hide welcome message when user asks first question
  useEffect(() => {
    if (history.length > 0) {
      setShowWelcome(false);
    }
  }, [history]);

  const handleAsk = async (e) => {
    e.preventDefault();
    setError('');
    if (!question.trim()) return;
    
    // Immediately add user's question to history with loading indicator for answer
    const tempId = Date.now();
    setHistory([...history, { id: tempId, question, answer: null, loading: true }]);
    setLoading(true);
    setQuestion(''); // Clear input immediately for better UX

    try {
      const response = await fetch('http://127.0.0.1:8800/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),

      });

      if (!response.ok) {
        throw new Error('Server error. Please try again.');
      }

      const data = await response.json();
      
      // Update the history entry with the real answer
      setHistory(prevHistory => 
        prevHistory.map(item => 
          item.id === tempId 
            ? { ...item, answer: data.answer, loading: false } 
            : item
        )
      );
    } catch (err) {
      // Update the history with error message
      setHistory(prevHistory => 
        prevHistory.map(item => 
          item.id === tempId 
            ? { ...item, answer: "Sorry, I couldn't get a response. Please check if the backend server is running.", loading: false, isError: true } 
            : item
        )
      );
      setError('Could not get a response from the assistant. Please check your backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setHistory([]);
    setQuestion('');
    setShowWelcome(true);
    setError('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 6px 16px rgba(26, 35, 126, 0.2)",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { 
      scale: 0.95,
      transition: { type: "spring", stiffness: 400 }
    }
  };

  // Legal facts for the sidebar
  const legalFacts = [
    "The Supreme Court of India has the power to review its own judgments.",
    "The Indian Constitution is the world's longest written constitution.",
    "The first law school in India was established in 1855 in Calcutta.",
    "The Indian Penal Code was drafted in 1860 and came into effect in 1862.",
    "The first woman judge of the Supreme Court of India was appointed in 1989.",
    "The Right to Information Act was passed in 2005, revolutionizing transparency.",
  ];

  // Select a random legal fact
  const randomFact = legalFacts[Math.floor(Math.random() * legalFacts.length)];

  return (
    // iscard ? <card />: <textCard messsage={response.messsage}/>
    <motion.div 
      className="app-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.nav 
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="navbar-container">
          <motion.div 
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBalanceScale className="logo-icon" />
            <span className="logo-text">LawGPT</span>
            <span className="logo-subtitle">Legal Case Research Assistant</span>
          </motion.div>
        </div>
      </motion.nav>

      <div className="main-content">
        <div className="container">
          {/* Sidebar */}
          <div 
            className="sidebar"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <div className="sidebar-content">
              <div className="sidebar-sections">
                {/* Did You Know Section */}
                <div className="sidebar-section">
                  <h3><FaLightbulb /> Did You Know?</h3>
                  <p>{randomFact}</p>
                </div>

                {/* Legal Tips Section */}
                <div className="sidebar-section">
                  <h3><FaBalanceScale /> Legal Tips</h3>
                  <ul>
                    <motion.li whileHover={{ x: 5 }}>Be specific in your legal questions</motion.li>
                    <motion.li whileHover={{ x: 5 }}>Include relevant jurisdiction information</motion.li>
                    <motion.li whileHover={{ x: 5 }}>Mention timeframes if applicable</motion.li>
                  </ul>
                </div>
              </div>

              {/* Call to Action Button Container */}
              <div className="sidebar-button-container">
                <motion.button
                  className="sidebar-button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => inputRef.current?.focus()}
                  variants={buttonVariants}
                >
                  <FaPaperPlane /> Ask a Legal Question
                </motion.button>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <motion.div 
            className="chat-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Chat Messages Area */}
            <div className="messages-container">
              <AnimatePresence>
                {showWelcome && history.length === 0 && (
                  <motion.div
                    className="welcome-container"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="welcome-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <FaGavel size={40} />
                    </motion.div>
                    <motion.h2 
                      className="welcome-title"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Welcome to LawGPT Assistant
                    </motion.h2>
                    <motion.div
                      className="welcome-message"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <TypewriterEffect 
                        text="I'm your AI legal research assistant. Ask me any legal question to get started!"
                        typingSpeed={50}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {history.map((item, idx) => (
                  <motion.div
                    key={item.id || idx}
                    className="message-group"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                  >
                    {/* Question */}
                    <motion.div
                      className="user-message"
                      layoutId={`question-${item.id || idx}`}
                    >
                      <motion.div 
                        className="avatar user-avatar"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <FaUserAlt />
                      </motion.div>
                      <motion.div 
                        className="message-bubble user-bubble"
                        initial={{ scale: 0.9, opacity: 0, x: 20 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {item.question}
                      </motion.div>
                    </motion.div>

                    {/* Answer */}
                    <motion.div
                      className="assistant-message"
                      layoutId={`answer-${item.id || idx}`}
                    >
                      <motion.div 
                        className="avatar assistant-avatar"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <FaRobot />
                      </motion.div>
                      
                      {item.loading ? (
                        <motion.div 
                          className="message-bubble assistant-bubble loading-bubble"
                          initial={{ scale: 0.9, opacity: 0, x: -20 }}
                          animate={{ scale: 1, opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <BounceLoader color="#1a237e" size={24} />
                          <span className="loading-text">Thinking...</span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className={`message-bubble assistant-bubble ${item.isError ? 'error-bubble' : ''}`}
                          initial={{ scale: 0.9, opacity: 0, x: -20 }}
                          animate={{ scale: 1, opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          {item.answer}
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input form at the bottom */}
            <motion.form 
              className="input-container"
              onSubmit={handleAsk}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
            >
              <motion.button
                type="button"
                className="new-chat-button"
                onClick={handleNewChat}
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                title="Start New Chat"
                variants={buttonVariants}
              >
                <AddBoxIcon style={{ fontSize: 32 }} />
              </motion.button>
              
              <motion.input
                ref={inputRef}
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Type your legal question..."
                disabled={loading}
                whileFocus={{ scale: 1.02 }}
              />
              
              <motion.button
                type="submit"
                disabled={loading || !question.trim()}
                className="send-button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                variants={buttonVariants}
              >
                {loading ? (
                  <BounceLoader color="#fff" size={16} />
                ) : (
                  <>
                    Ask <FaPaperPlane />
                  </>
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default App;


