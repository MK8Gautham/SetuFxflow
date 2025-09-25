import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Upload, Download, Phone, Settings, Clock, User, Building2, CreditCard, Smartphone } from 'lucide-react';

// Types
interface Message {
  id: string;
  type: 'text' | 'quickReply' | 'form' | 'summary' | 'receipt' | 'typing';
  sender: 'user' | 'bot';
  content: any;
  timestamp: Date;
}

interface AppState {
  currentState: string;
  purpose: string;
  currency: string;
  fxAmount: number;
  rate: number;
  gstPercent: number;
  quoteTTL: number;
  quoteExpiry: Date | null;
  kycDocs: { [key: string]: boolean };
  paymentId: string;
  utr: string;
}

interface DemoControls {
  forceKycOk: boolean;
  forcePaymentSuccess: boolean;
  forceRemitSuccess: boolean;
  customUtr: string;
}

const INITIAL_STATE: AppState = {
  currentState: 'idle',
  purpose: 'Overseas Education',
  currency: 'USD',
  fxAmount: 100,
  rate: 85,
  gstPercent: 18,
  quoteTTL: 10,
  quoteExpiry: null,
  kycDocs: { pan: false, passport: false, admission: false },
  paymentId: '',
  utr: '12345'
};

const PURPOSES = [
  'Overseas Education',
  'Business Travel',
  'Medical Treatment',
  'Tourism',
  'Family Maintenance'
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' }
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [demoControls, setDemoControls] = useState<DemoControls>({
    forceKycOk: true,
    forcePaymentSuccess: true,
    forceRemitSuccess: true,
    customUtr: '12345'
  });
  const [showDemoControls, setShowDemoControls] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (appState.currentState === 'idle' && !isInitialized) {
      addMessage({
        id: 'welcome',
        type: 'text',
        sender: 'bot',
        content: 'Hello! 👋 Welcome to Setu FX. How can I help you today?',
        timestamp: new Date()
      });
      
      setTimeout(() => {
        addMessage({
          id: 'quick-reply-1',
          type: 'quickReply',
          sender: 'bot',
          content: {
            text: 'Choose a service:',
            options: [
              { id: 'money-transfer', text: 'Money Transfer' },
              { id: 'buy-forex', text: 'Buy Forex' },
              { id: 'sell-forex', text: 'Sell Forex' }
            ]
          },
          timestamp: new Date()
        });
      }, 500);
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const addMessage = (message: Omit<Message, 'id'> & { id?: string }) => {
    const newMessage = {
      ...message,
      id: message.id || Date.now().toString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (duration: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), duration);
  };

  const handleQuickReply = (optionId: string, text: string) => {
    addMessage({
      type: 'text',
      sender: 'user',
      content: text,
      timestamp: new Date()
    });

    if (optionId === 'money-transfer') {
      simulateTyping();
      setTimeout(() => {
        setAppState(prev => ({ ...prev, currentState: 'chooseType' }));
        addMessage({
          type: 'form',
          sender: 'bot',
          content: {
            title: 'Money Transfer Details',
            fields: ['purpose', 'currency', 'amount']
          },
          timestamp: new Date()
        });
      }, 1200);
    } else {
      simulateTyping();
      setTimeout(() => {
        addMessage({
          type: 'text',
          sender: 'bot',
          content: '🚧 This service is coming soon! Please try Money Transfer for now.',
          timestamp: new Date()
        });
      }, 800);
    }
  };

  const handleFormSubmit = (formData: any) => {
    setAppState(prev => ({
      ...prev,
      purpose: formData.purpose,
      currency: formData.currency,
      fxAmount: parseFloat(formData.amount),
      currentState: 'quoting'
    }));

    addMessage({
      type: 'text',
      sender: 'user',
      content: `Purpose: ${formData.purpose}, Currency: ${formData.currency}, Amount: ${formData.amount}`,
      timestamp: new Date()
    });

    simulateTyping(1500);
    setTimeout(() => {
      addMessage({
        type: 'text',
        sender: 'bot',
        content: '🔍 Validating purpose & LRS limits...',
        timestamp: new Date()
      });
    }, 1500);

    setTimeout(() => {
      simulateTyping(1000);
      setTimeout(() => {
        addMessage({
          type: 'text',
          sender: 'bot',
          content: '💱 Fetching live exchange rate...',
          timestamp: new Date()
        });
      }, 1000);
    }, 2500);

    setTimeout(() => {
      const quoteExpiry = new Date();
      quoteExpiry.setMinutes(quoteExpiry.getMinutes() + appState.quoteTTL);
      
      setAppState(prev => ({
        ...prev,
        currentState: 'quoteReady',
        quoteExpiry
      }));

      addMessage({
        type: 'summary',
        sender: 'bot',
        content: { showKycUpload: true },
        timestamp: new Date()
      });
    }, 4000);
  };

  const handleKycUpload = (docType: string) => {
    setAppState(prev => ({
      ...prev,
      kycDocs: { ...prev.kycDocs, [docType]: true }
    }));

    const allDocsUploaded = Object.values({
      ...appState.kycDocs,
      [docType]: true
    }).every(Boolean);

    if (allDocsUploaded) {
      simulateTyping(1500);
      setTimeout(() => {
        addMessage({
          type: 'text',
          sender: 'bot',
          content: '📋 KYC documents received. Verifying...',
          timestamp: new Date()
        });
      }, 1500);

      setTimeout(() => {
        if (demoControls.forceKycOk) {
          addMessage({
            type: 'text',
            sender: 'bot',
            content: '✅ KYC verification completed successfully!',
            timestamp: new Date()
          });
          setAppState(prev => ({ ...prev, currentState: 'payReady' }));
          
          setTimeout(() => {
            addMessage({
              type: 'summary',
              sender: 'bot',
              content: { showPayButton: true },
              timestamp: new Date()
            });
          }, 500);
        } else {
          addMessage({
            type: 'text',
            sender: 'bot',
            content: '❌ KYC verification failed: Passport image is unclear. Please re-upload a clear image.',
            timestamp: new Date()
          });
        }
      }, 3000);
    }
  };

  const handlePayment = () => {
    setShowCheckout(true);
  };

  const processPayment = (method: string) => {
    setShowCheckout(false);
    
    if (demoControls.forcePaymentSuccess) {
      const paymentId = `pay_mock_${Math.random().toString(36).substr(2, 6)}`;
      setAppState(prev => ({ ...prev, paymentId, currentState: 'paymentSuccess' }));
      
      addMessage({
        type: 'text',
        sender: 'bot',
        content: `✅ Payment received successfully! Payment ID: ${paymentId}`,
        timestamp: new Date()
      });

      simulateTyping(2000);
      setTimeout(() => {
        addMessage({
          type: 'text',
          sender: 'bot',
          content: '🏦 Initiating remittance via eBIX...',
          timestamp: new Date()
        });
      }, 2000);

      setTimeout(() => {
        const utr = demoControls.customUtr;
        setAppState(prev => ({ ...prev, utr, currentState: 'remitCompleted' }));
        
        addMessage({
          type: 'text',
          sender: 'bot',
          content: `🎉 Remittance successful! UTR: ${utr}`,
          timestamp: new Date()
        });

        setTimeout(() => {
          addMessage({
            type: 'receipt',
            sender: 'bot',
            content: {},
            timestamp: new Date()
          });
        }, 1000);
      }, 4500);
    } else {
      addMessage({
        type: 'text',
        sender: 'bot',
        content: '❌ Payment failed: Card declined. Please try a different payment method.',
        timestamp: new Date()
      });
    }
  };

  const downloadReceipt = () => {
    const receiptHtml = generateReceiptHtml();
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setu-fx-receipt-${appState.utr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReceiptHtml = () => {
    const inrAmount = appState.fxAmount * appState.rate;
    const gstAmount = (inrAmount * appState.gstPercent) / 100;
    const totalAmount = inrAmount + gstAmount;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Setu FX - Money Transfer Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #25D366; padding-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .total { font-weight: bold; font-size: 1.2em; color: #25D366; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Setu FX</h1>
        <p>Money Transfer Receipt</p>
    </div>
    <div class="details">
        <div class="detail-row"><span>Transaction ID:</span><span>${appState.paymentId}</span></div>
        <div class="detail-row"><span>UTR:</span><span>${appState.utr}</span></div>
        <div class="detail-row"><span>Purpose:</span><span>${appState.purpose}</span></div>
        <div class="detail-row"><span>Currency:</span><span>${appState.currency}</span></div>
        <div class="detail-row"><span>FX Amount:</span><span>${appState.currency} ${appState.fxAmount}</span></div>
        <div class="detail-row"><span>Exchange Rate:</span><span>1 ${appState.currency} = ₹${appState.rate}</span></div>
        <div class="detail-row"><span>INR Amount:</span><span>₹${inrAmount.toFixed(2)}</span></div>
        <div class="detail-row"><span>GST (${appState.gstPercent}%):</span><span>₹${gstAmount.toFixed(2)}</span></div>
        <div class="detail-row total"><span>Total Paid:</span><span>₹${totalAmount.toFixed(2)}</span></div>
        <div class="detail-row"><span>Date:</span><span>${new Date().toLocaleString()}</span></div>
    </div>
    <p style="margin-top: 40px; font-size: 0.9em; color: #666;">
        This is a demo receipt. Merchant-of-Record: eBIX (demo)
    </p>
</body>
</html>`;
  };

  const inrAmount = appState.fxAmount * appState.rate;
  const gstAmount = (inrAmount * appState.gstPercent) / 100;
  const totalAmount = inrAmount + gstAmount;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Phone Frame */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="phone-frame bg-black rounded-[2.5rem] p-2 shadow-2xl max-w-sm w-full h-[844px] relative overflow-hidden">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
          
          {/* Screen */}
          <div className="bg-white rounded-[2rem] h-full flex flex-col relative overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center font-bold text-sm">
                  SF
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Setu FX</span>
                    <Check className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="text-xs opacity-75">online</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full px-2 py-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span className="text-xs">eBIX</span>
                </div>
              </div>
            </div>

            {/* Chat Background */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#E5DDD5] opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='m20 20 20-20v40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              {/* Messages */}
              <div className="relative z-10 p-4 space-y-3 h-full overflow-y-auto">
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    appState={appState}
                    onQuickReply={handleQuickReply}
                    onFormSubmit={handleFormSubmit}
                    onKycUpload={handleKycUpload}
                    onPayment={handlePayment}
                    onDownloadReceipt={downloadReceipt}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex">
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
        showDemoControls ? 'w-80' : 'w-12'
      } ${showDemoControls ? 'block' : 'hidden md:block'}`}>
        <div className="p-4">
          <button
            onClick={() => setShowDemoControls(!showDemoControls)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-800"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {showDemoControls && (
            <div className="mt-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Demo Controls</h3>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={demoControls.forceKycOk}
                    onChange={(e) => setDemoControls(prev => ({ ...prev, forceKycOk: e.target.checked }))}
                  />
                  <span className="text-sm">Force KYC Success</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={demoControls.forcePaymentSuccess}
                    onChange={(e) => setDemoControls(prev => ({ ...prev, forcePaymentSuccess: e.target.checked }))}
                  />
                  <span className="text-sm">Force Payment Success</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom UTR</label>
                <input
                  type="text"
                  value={demoControls.customUtr}
                  onChange={(e) => setDemoControls(prev => ({ ...prev, customUtr: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Current State</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {appState.currentState}
                </div>
              </div>

              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                <strong>Flow-2 Rails:</strong> Pine Labs PA escrow → T+1 to eBIX for presenter notes
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          totalAmount={totalAmount}
          onClose={() => setShowCheckout(false)}
          onPayment={processPayment}
        />
      )}

      {/* Mobile Demo Controls Toggle */}
      <button
        onClick={() => setShowDemoControls(!showDemoControls)}
        className="md:hidden fixed bottom-4 right-4 bg-[#25D366] text-white p-3 rounded-full shadow-lg"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message, appState, onQuickReply, onFormSubmit, onKycUpload, onPayment, onDownloadReceipt }: any) {
  const isUser = message.sender === 'user';
  
  if (message.type === 'quickReply') {
    return (
      <div className="flex">
        <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm max-w-xs">
          <p className="text-sm mb-2">{message.content.text}</p>
          <div className="flex flex-wrap gap-2">
            {message.content.options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => onQuickReply(option.id, option.text)}
                className="bg-[#25D366] text-white px-3 py-1 rounded-full text-sm hover:bg-[#20c55e]"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'form') {
    return <FormCard appState={appState} onSubmit={onFormSubmit} />;
  }

  if (message.type === 'summary') {
    return (
      <SummaryCard 
        appState={appState}
        showKycUpload={message.content.showKycUpload}
        showPayButton={message.content.showPayButton}
        onKycUpload={onKycUpload}
        onPayment={onPayment}
      />
    );
  }

  if (message.type === 'receipt') {
    return (
      <div className="flex">
        <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm max-w-xs">
          <div className="text-center">
            <div className="text-2xl mb-2">🧾</div>
            <p className="text-sm mb-3">Your remittance receipt is ready</p>
            <button
              onClick={onDownloadReceipt}
              className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : ''}`}>
      <div className={`rounded-2xl px-4 py-2 shadow-sm max-w-xs ${
        isUser 
          ? 'bg-[#DCF8C6] rounded-br-md' 
          : 'bg-white rounded-bl-md'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && (
            <div className="flex">
              <Check className="w-3 h-3 text-[#25D366]" />
              <Check className="w-3 h-3 text-[#25D366] -ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Card Component
function FormCard({ appState, onSubmit }: any) {
  const [formData, setFormData] = useState({
    purpose: appState.purpose,
    currency: appState.currency,
    amount: appState.fxAmount.toString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex">
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm max-w-xs w-full">
        <h4 className="font-semibold text-sm mb-3">Money Transfer Details</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Purpose</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {PURPOSES.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="1"
              step="0.01"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#25D366] text-white py-2 rounded-lg text-sm font-medium"
          >
            Get Quote
          </button>
        </form>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ appState, showKycUpload, showPayButton, onKycUpload, onPayment }: any) {
  const inrAmount = appState.fxAmount * appState.rate;
  const gstAmount = (inrAmount * appState.gstPercent) / 100;
  const totalAmount = inrAmount + gstAmount;
  
  const [timeLeft, setTimeLeft] = useState(appState.quoteTTL * 60);

  useEffect(() => {
    if (!appState.quoteExpiry) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = appState.quoteExpiry.getTime();
      const difference = expiry - now;
      
      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appState.quoteExpiry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex">
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm max-w-xs w-full">
        <h4 className="font-semibold text-sm mb-3">Transfer Summary</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span>Money Transfer</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Purpose:</span>
            <span>{appState.purpose}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">FX Amount:</span>
            <span>{appState.currency} {appState.fxAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rate:</span>
            <span>1 {appState.currency} = ₹{appState.rate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">INR Amount:</span>
            <span>₹{inrAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST ({appState.gstPercent}%):</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total Payable:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {appState.quoteExpiry && (
          <div className="mt-3 flex items-center gap-2 text-xs bg-yellow-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            <span>Quote expires in: {formatTime(timeLeft)}</span>
          </div>
        )}

        {showKycUpload && (
          <div className="mt-4">
            <h5 className="font-medium text-sm mb-2">Upload KYC Documents</h5>
            <div className="space-y-2">
              {[
                { key: 'pan', label: 'PAN Card' },
                { key: 'passport', label: 'Passport' },
                { key: 'admission', label: 'Admission Letter' }
              ].map(doc => (
                <div key={doc.key} className="flex items-center justify-between">
                  <span className="text-xs">{doc.label}</span>
                  {appState.kycDocs[doc.key] ? (
                    <div className="flex items-center gap-1 text-[#25D366]">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onKycUpload(doc.key)}
                      className="flex items-center gap-1 text-blue-600 text-xs"
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showPayButton && timeLeft > 0 && (
          <button
            onClick={onPayment}
            className="w-full mt-4 bg-[#25D366] text-white py-2 rounded-lg text-sm font-medium"
          >
            Pay Now - ₹{totalAmount.toFixed(2)}
          </button>
        )}

        {timeLeft === 0 && (
          <button
            className="w-full mt-4 bg-gray-400 text-white py-2 rounded-lg text-sm font-medium cursor-not-allowed"
            disabled
          >
            Quote Expired - Refresh Rate
          </button>
        )}
      </div>
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ totalAmount, onClose, onPayment }: any) {
  const [selectedMethod, setSelectedMethod] = useState('upi');

  const handlePayment = () => {
    onPayment(selectedMethod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Pine Plural Checkout (Mock)</h3>
          <p className="text-2xl font-bold text-[#25D366] mt-2">₹{totalAmount.toFixed(2)}</p>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="upi"
              checked={selectedMethod === 'upi'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
            <Smartphone className="w-5 h-5" />
            <span>UPI</span>
          </label>
          
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
            <CreditCard className="w-5 h-5" />
            <span>Debit/Credit Card</span>
          </label>
          
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="netbanking"
              checked={selectedMethod === 'netbanking'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
            <Building2 className="w-5 h-5" />
            <span>Net Banking</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 px-4 py-2 bg-[#25D366] text-white rounded-lg font-medium"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;