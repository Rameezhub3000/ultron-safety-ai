import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Volume2 } from 'lucide-react';
import { speakUltron } from '../utils/speechService';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello, I am ULTRON, your AI Safety Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', { message: userMessage.content });
      const aiReply = res.data.reply;
      setMessages(prev => [...prev, { role: 'ai', content: aiReply }]);
      
      // Voice Feedback for AI Reply with high quality natural voice
      speakUltron(aiReply);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to my servers right now.' }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <h1>AI Safety Chat</h1>
      
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}>
              {m.role === 'ai' && (
                <img src="/archreactor-logo.png" alt="ULTRON" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', alignSelf: 'flex-end', border: '1px solid rgba(0, 210, 255, 0.6)', boxShadow: '0 0 10px rgba(0, 210, 255, 0.4)' }} />
              )}
              <div 
                className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                style={{
                  maxWidth: '70%',
                  padding: '12px 18px',
                  borderRadius: '18px',
                  color: 'white',
                  lineHeight: '1.5',
                  fontSize: '15px',
                  position: 'relative'
                }}>
                {m.content}
                {m.role === 'ai' && (
                  <button
                    type="button"
                    onClick={() => speakUltron(m.content)}
                    title="Replay Voice Speech"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '4px',
                      marginLeft: '8px',
                      verticalAlign: 'middle',
                      cursor: 'pointer',
                      color: '#00d2ff',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <Volume2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, margin: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
          <button type="submit" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)', border: '1px solid rgba(56, 189, 248, 0.4)', boxShadow: '0 0 15px rgba(0, 210, 255, 0.3)' }}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
