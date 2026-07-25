import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Are EL MEN supplements safe and lab-tested?",
    answer: "Yes, absolutely. All EL MEN products are manufactured in GMP-certified cleanroom facilities and undergo rigorous third-party NABL laboratory testing to verify ingredient purity, potency, and to ensure they are 100% free of any banned substances."
  },
  {
    question: "How long does shipping take?",
    answer: "We process and dispatch all orders within 24 hours. Express shipping typically takes 2-4 business days for major metro cities, and 4-7 business days for other regions across India. You will receive a tracking link via SMS/email once dispatched."
  },
  {
    question: "What is your returns and refund policy?",
    answer: "We offer a hassle-free 14-day return policy for unopened items in their original packaging. If you receive a damaged product or want to initiate a return, contact our WhatsApp Chat Support or email us directly."
  },
  {
    question: "Which protein is best for lean muscle growth?",
    answer: "Our Clean Whey Protein is the gold standard for lean muscle building and faster recovery. It delivers 24g of fast-absorbing protein, 5.5g of BCAAs, and 4.2g of Glutamic Acid per scoop, making it perfect for post-workout nutrition."
  },
  {
    question: "Do you import raw materials from the USA?",
    answer: "Yes, we prioritize premium quality above all. Our primary whey protein isolates, concentrates, and key minerals are imported directly from elite manufacturers in the USA, ensuring world-class standards for our athletes."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq" style={{ padding: '80px 0', background: '#fcfcfc', borderBottom: '1px solid #eaeaea' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ color: 'var(--primary-yellow)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>FAQ HELP CENTER</span>
          <h2 style={{ textTransform: 'uppercase', fontWeight: 900, fontSize: '2.5rem', marginTop: '10px', color: '#1a1a1a' }}>
            Frequently Asked <span style={{ color: 'var(--primary-yellow)' }}>Questions</span>
          </h2>
          <p style={{ color: '#555555', margin: '16px auto 0', fontSize: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Got questions? We've got answers. Everything you need to know about our supplements and service.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${isOpen ? 'var(--primary-yellow)' : '#e0e0e0'}`,
                  borderRadius: 'var(--border-radius)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  boxShadow: isOpen ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#1a1a1a',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <HelpCircle size={20} color={isOpen ? 'var(--primary-yellow)' : '#888888'} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '0.3px' }}>{faq.question}</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    color={isOpen ? 'var(--primary-yellow)' : '#888888'}
                    style={{ 
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0
                    }} 
                  />
                </button>

                <div 
                  style={{
                    maxHeight: isOpen ? '250px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: isOpen ? '0 24px 24px 60px' : '0 24px'
                  }}
                >
                  <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
