import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../config/api";
import { Search, Truck, ShieldCheck, Clock, MapPin, AlertCircle, Calendar, ArrowLeft, Clipboard, Check } from 'lucide-react';

export default function TrackOrder({ initialAwb = '', onGoBack }) {
  const [awb, setAwb] = useState(initialAwb);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (initialAwb) {
      setAwb(initialAwb);
      fetchTracking(initialAwb);
    } else {
      setAwb('');
      setTrackingData(null);
      setErrorMsg('');
    }
  }, [initialAwb]);

  const fetchTracking = async (awbNumber) => {
    const trimmed = awbNumber.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorMsg('');
    setTrackingData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/track`, {
        trackingNumber: trimmed
      });

      if (response.data && response.data.success && response.data.tracking) {
        setTrackingData(response.data.tracking);
      } else {
        setErrorMsg(response.data.message || 'Tracking number not recognized by logistics system.');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch tracking details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    fetchTracking(awb);
  };

  const handleDemoClick = (codeVal) => {
    setAwb(codeVal);
    fetchTracking(codeVal);
    navigator.clipboard.writeText(codeVal);
    setCopiedCode(codeVal);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // iThink status mapping to standard milestones
  const getMilestoneIndex = (status) => {
    if (!status) return 0;
    const lower = status.toLowerCase();
    if (lower.includes('delivered') && !lower.includes('undelivered') && !lower.includes('rto')) return 4;
    if (lower.includes('out for delivery') || lower.includes('ofd')) return 3;
    if (lower.includes('in transit') || lower.includes('transit') || lower.includes('reached at origin') || lower.includes('reached at destination') || lower.includes('misrouted')) return 2;
    if (lower.includes('picked up') || lower.includes('pickup')) return 1;
    return 0; // Manifested / UD / Cancelled
  };

  const milestones = [
    { label: 'Manifested', desc: 'Ready for pickup' },
    { label: 'Picked Up', desc: 'Handed to courier' },
    { label: 'In Transit', desc: 'On the way to destination' },
    { label: 'Out For Delivery', desc: 'Out with delivery agent' },
    { label: 'Delivered', desc: 'Received successfully' }
  ];

  const currentIndex = trackingData ? getMilestoneIndex(trackingData.current_status) : -1;
  const isCancelled = trackingData?.current_status?.toLowerCase().includes('cancel');

  return (
    <div
      className="track-order-wrapper"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f4f6f9 100%)',
        minHeight: '85vh',
        paddingTop: '150px',
        paddingBottom: '80px',
        paddingLeft: 0,
        paddingRight: 0,
        color: '#1e293b',
        fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative premium gradient blur backgrounds */}
      <div style={{ position: 'absolute', top: '-10%', left: '5%', width: '400px', height: '400px', background: 'rgba(251, 191, 36, 0.06)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'rgba(34, 197, 94, 0.04)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      <div className="container" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Back Link & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
          <button
            onClick={onGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              borderRadius: '30px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              padding: '8px 18px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-yellow)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 190, 0, 0.2)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <ArrowLeft size={16} /> Back to Store
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fde68a', padding: '8px 18px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)', whiteSpace: 'nowrap' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#d97706', borderRadius: '50%', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.75px' }}>
              iThink Logistics Partner
            </span>
          </div>
        </div>

        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 14px 0', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
            Track Your <span style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Order</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
            Monitor delivery updates, transit location logs, and estimated arrival milestones in real-time.
          </p>
        </div>

        {/* Search Panel Card */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            padding: '40px',
            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.05)',
            marginBottom: '40px',
            position: 'relative'
          }}
        >
          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter AWB Tracking Number..."
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  borderRadius: '100px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '1rem',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#fbbf24';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(251, 191, 36, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !awb.trim()}
              style={{
                padding: '18px 40px',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '900',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#0f172a',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && awb.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.25)';
              }}
            >
              {isLoading ? 'Searching...' : (
                <>
                  <Search size={18} />
                  Track Order
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sandboxes */}
          {!trackingData && !isLoading && (
            <div style={{ marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '28px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, display: 'block', marginBottom: '14px', textAlign: 'center' }}>
                Quick Test Sandbox (Click to Track)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {[
                  { code: '1369010033902', label: 'Delivered Shipment', status: 'Delivered' },
                  { code: 'ELMEN-TRACK-DEMO', label: 'In Transit Shipment', status: 'In Transit' },
                  { code: 'ELMEN-TRACK-CANCELLED', label: 'Cancelled Shipment', status: 'Cancelled' }
                ].map((demo) => (
                  <button
                    key={demo.code}
                    type="button"
                    onClick={() => handleDemoClick(demo.code)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.01)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fbbf24';
                      e.currentTarget.style.transform = 'translateY(-1.5px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(251, 191, 36, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.01)';
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{demo.label}</span>
                      <code style={{ fontSize: '0.8rem', color: '#b45309', fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>{demo.code}</code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1' }}>
                      {copiedCode === demo.code ? (
                        <Check size={16} style={{ color: '#22c55e' }} />
                      ) : (
                        <Clipboard size={15} style={{ opacity: 0.5 }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div className="loading-spinner" style={{ width: '45px', height: '45px', borderLeftColor: '#fbbf24', borderTopWidth: '3px', borderWidth: '3px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '20px', color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Syncing database with courier servers...</p>
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div style={{ display: 'flex', gap: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '20px 28px', borderRadius: '18px', margin: '20px 0', alignItems: 'center', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.02)' }}>
            <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.95rem', marginBottom: '2px' }}>Tracking Failed</strong>
              <span style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Active Tracking Portal */}
        {trackingData && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '40px',
              boxShadow: '0 30px 80px rgba(15, 23, 42, 0.04)',
              animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Title block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Tracking Portal</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>Shipment Overview</h3>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Live Syncing</span>
              </div>
            </div>

            {/* Courier Meta Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {[
                { title: 'AWB Number', val: trackingData.awb_no, isMono: true },
                { title: 'Courier Partner', val: trackingData.logistic },
                { title: 'Current Status', val: trackingData.current_status, isStatus: true },
                { title: 'Estimated Arrival', val: trackingData.expected_delivery_date ? new Date(trackingData.expected_delivery_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Pending Update', isHighlight: true }
              ].map((card, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.75px', fontWeight: 700 }}>{card.title}</span>
                  <strong
                    style={{
                      fontSize: '1rem',
                      color: card.isStatus ? (isCancelled ? '#ef4444' : '#10b981') : (card.isHighlight ? '#d97706' : '#0f172a'),
                      fontFamily: card.isMono ? 'monospace' : 'inherit',
                      textTransform: card.isStatus ? 'uppercase' : 'none',
                      fontWeight: card.isStatus || card.isHighlight ? '800' : '700'
                    }}
                  >
                    {card.val}
                  </strong>
                </div>
              ))}
            </div>

            {/* Cancellation Notice */}
            {isCancelled && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '18px 24px', borderRadius: '16px', marginBottom: '40px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span style={{ color: '#991b1b', fontSize: '0.9rem', fontWeight: 500 }}>
                  This consignment has been cancelled. Please contact customer support for further assistance regarding returns or refunds.
                </span>
              </div>
            )}

            {/* Step-by-Step progress tracker */}
            {!isCancelled && (
              <div style={{ marginBottom: '56px' }}>
                <h4 style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.8rem', color: '#64748b', letterSpacing: '1px', marginBottom: '24px' }}>
                  Delivery Milestones
                </h4>

                {/* Horizontal Progress Timeline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: '16px', gap: '8px' }}>
                  {milestones.map((m, idx) => {
                    const isPassed = idx <= currentIndex;
                    const isActive = idx === currentIndex;
                    const isLast = idx === milestones.length - 1;

                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          position: 'relative',
                          minWidth: '110px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        {/* Connecting track line */}
                        {!isLast && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '20px',
                              left: '50%',
                              right: '-50%',
                              height: '4px',
                              backgroundColor: idx < currentIndex ? '#10b981' : '#e2e8f0',
                              zIndex: 1,
                              transition: 'background-color 0.3s ease',
                              borderRadius: '2px'
                            }}
                          />
                        )}

                        {/* Node bubble */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: isPassed ? '#10b981' : '#ffffff',
                            border: `3px solid ${isPassed ? '#10b981' : '#e2e8f0'}`,
                            color: isPassed ? '#ffffff' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            boxShadow: isActive ? '0 0 0 6px rgba(16, 185, 129, 0.15)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'default'
                          }}
                        >
                          {isPassed ? (
                            <ShieldCheck size={20} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>

                        {/* Node titles */}
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            marginTop: '14px',
                            color: isActive ? '#0f172a' : isPassed ? '#334155' : '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.25px'
                          }}
                        >
                          {m.label}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', maxWidth: '100px', lineHeight: '1.4' }}>
                          {m.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Travel scans logs */}
            {trackingData.scan_details && trackingData.scan_details.length > 0 && (
              <div>
                <h4 style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.8rem', color: '#64748b', letterSpacing: '1px', marginBottom: '24px' }}>
                  Detailed Transit logs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {trackingData.scan_details.map((scan, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '24px',
                        position: 'relative',
                        paddingBottom: '24px',
                        marginLeft: '16px'
                      }}
                    >
                      {/* Vertical connector line */}
                      {idx !== trackingData.scan_details.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '5px',
                            top: '20px',
                            bottom: 0,
                            width: '2px',
                            backgroundColor: '#e2e8f0'
                          }}
                        />
                      )}

                      {/* Node point */}
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#10b981' : '#cbd5e1',
                          border: '2px solid #ffffff',
                          boxShadow: idx === 0 ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                          zIndex: 2,
                          marginTop: '6px',
                          flexShrink: 0
                        }}
                      />

                      {/* Card block */}
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '18px 24px',
                          boxShadow: idx === 0 ? '0 8px 24px rgba(0, 0, 0, 0.02)' : 'none',
                          transition: 'all 0.25s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.25px' }}>
                            {scan.status}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                            <Calendar size={12} />
                            {scan.scan_date_time}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <strong>{scan.scan_location}</strong>
                          </span>
                          {scan.remark && (
                            <span style={{ color: '#64748b', fontStyle: 'italic', marginTop: '4px', paddingLeft: '20px', borderLeft: '2px solid #e2e8f0' }}>
                              {scan.remark}
                            </span>
                          )}
                          {scan.status_reason && (
                            <span style={{ color: '#ef4444', fontStyle: 'italic', paddingLeft: '20px', borderLeft: '2px solid #fecaca', fontWeight: 500 }}>
                              Reason: {scan.status_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
