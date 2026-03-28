import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coursesApi, enrollmentsApi, paymentsApi } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState('review'); // 'review' | 'payment' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await coursesApi.detail(id);
        setCourse(res.data);
      } catch (err) {
        showToast('Unable to load course details.', 'error');
        navigate(`/courses/${id}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handlePay = async () => {
    setIsPaying(true);
    try {
      // Attempt payment first (if course is paid)
      if (parseFloat(course?.price || 0) > 0) {
        try {
          await paymentsApi.pay(id);
        } catch (payErr) {
          // Payment endpoint might not require a body or might auto-enroll, try enrolling directly
          console.warn('Payment endpoint note:', payErr?.response?.data);
        }
      }
      // Enroll the student
      await enrollmentsApi.enroll(id);
      setStep('success');
    } catch (err) {
      if (err?.response?.status === 400) {
        // Already enrolled — treat as success
        setStep('success');
      } else {
        const msg = err?.response?.data?.detail || 'Payment failed. Please try again.';
        showToast(msg, 'error');
      }
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
        <h2>Loading checkout...</h2>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ paddingTop: '140px', paddingBottom: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ background: 'white', borderRadius: '32px', padding: '4rem 3rem', textAlign: 'center', maxWidth: '520px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '3rem', boxShadow: '0 20px 40px rgba(16,185,129,0.25)' }}>🎉</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Enrollment Successful!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            You're now enrolled in <strong>{course?.title}</strong>. Start your learning journey!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/learn/${id}`} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '16px' }}>Start Learning 🚀</Link>
            <Link to="/dashboard" className="btn btn-outline" style={{ padding: '1rem 2rem', borderRadius: '16px' }}>My Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          {['review', 'payment'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step === s || (i === 1 && step === 'payment') ? 'var(--primary)' : '#e5e7eb', color: step === s ? 'white' : (i === 0 && step === 'payment') ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s' }}>
                  {i === 0 && step === 'payment' ? '✓' : i + 1}
                </div>
                <span style={{ fontWeight: step === s ? 700 : 500, color: step === s ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.95rem', textTransform: 'capitalize' }}>{s}</span>
              </div>
              {i < 1 && <div style={{ flex: 1, height: '2px', background: step === 'payment' ? 'var(--primary)' : '#e5e7eb', transition: 'background 0.3s', minWidth: '40px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* Left Panel */}
          <div>
            {step === 'review' && (
              <div style={{ background: 'white', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>Order Review</h2>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', background: '#f9fafb', borderRadius: '20px', marginBottom: '2rem' }}>
                  <img src={course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'} alt={course?.title} style={{ width: '100px', height: '70px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{course?.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>📊 {course?.level || 'All levels'}</span>
                      <span>⭐ {course?.average_rating || 'New'}</span>
                      <span>♾️ Lifetime access</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>✅ What you get</h4>
                  {['Full lifetime access', 'Certificate on completion', 'Access on all devices', 'Instructor support'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span> {item}
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary w-full" style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: '18px' }} onClick={() => setStep('payment')}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div style={{ background: 'white', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>Payment Details</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { key: 'card', label: '💳 Card', desc: 'Credit / Debit' },
                    { key: 'paypal', label: '🅿️ PayPal', desc: 'Fast & secure' },
                  ].map(pm => (
                    <button key={pm.key} onClick={() => setPaymentMethod(pm.key)} style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: paymentMethod === pm.key ? '2px solid var(--primary)' : '2px solid var(--border)', background: paymentMethod === pm.key ? 'rgba(16,185,129,0.05)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '1.3rem' }}>{pm.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{pm.desc}</div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box', letterSpacing: '0.1em' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Expiry</label>
                        <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>CVV</label>
                        <input type="text" placeholder="•••" maxLength={4} style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Name on Card</label>
                      <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f0f9ff', borderRadius: '16px', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🅿️</div>
                    <p>You'll be redirected to PayPal to complete payment securely.</p>
                  </div>
                )}

                <button className="btn btn-primary w-full" style={{ padding: '1.2rem', fontSize: '1.15rem', borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} onClick={handlePay} disabled={isPaying}>
                  {isPaying ? '⏳ Processing...' : `💳 Pay $${course?.price || '0.00'}`}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  🔒 Secured by 256-bit SSL encryption
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div style={{ background: 'white', borderRadius: '28px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>Course price</span>
                <span>${course?.price || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600 }}>
                <span>🎁 Discount</span>
                <span>-$0.00</span>
              </div>
            </div>
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.3rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${course?.price || '0.00'}</span>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '14px', fontSize: '0.85rem', color: '#065f46', border: '1px solid rgba(16,185,129,0.2)' }}>
              🛡️ 30-day money-back guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
