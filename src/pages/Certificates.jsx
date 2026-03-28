import { useState, useEffect } from 'react';
import { certificatesApi, responseUtils } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await certificatesApi.myCertificates();
        setCertificates(responseUtils.toArray(response.data));
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
        showToast('Unable to load your certificates. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading achievements...</h2></div>;

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="mb-12 text-center">
        <span className="badge">Verified Excellence</span>
        <h1 className="mt-2 text-gradient">My Certificates</h1>
        <p className="text-text-muted mt-4">A showcase of your completed learning paths and verified skills.</p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map(cert => (
            <div key={cert.id} className="glass p-8 rounded-3xl border-primary" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '6rem', opacity: 0.05 }}>🏆</div>
              <div className="text-xs text-primary font-bold mb-4 tracking-widest uppercase">Official Certification</div>
              <h3 className="mb-2">{cert.course_name || 'Course Title'}</h3>
              <p className="text-sm text-text-muted mb-8">Issued on {new Date(cert.issued_at || Date.now()).toLocaleDateString()}</p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Verify ID: #{cert.id.slice(0, 8)}</span>
                  <a href={cert.file_url} target="_blank" rel="noreferrer" className="btn btn-outline py-2 px-4 text-xs">View Original</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-16 text-center rounded-3xl" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎓</div>
          <h2>Your trophy case is waiting</h2>
          <p className="text-text-muted mb-8 mt-4">Complete courses to earn verified certificates and showcase your expertise to the world.</p>
          <a href="/courses" className="btn btn-primary px-8">Browse Courses</a>
        </div>
      )}
    </div>
  );
};

export default Certificates;
