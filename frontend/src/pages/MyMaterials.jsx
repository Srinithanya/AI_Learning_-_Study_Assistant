import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Database,
  X,
  FileCode,
  BookOpen
} from 'lucide-react';
import { api } from '../api';

export default function MyMaterials() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [subject, setSubject] = useState('Operating Systems');
  const [selectedChunks, setSelectedChunks] = useState(null);
  const [chunkModalOpen, setChunkModalOpen] = useState(false);

  const loadDocuments = async () => {
    try {
      const data = await api.listDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    try {
      await api.uploadDocument(formData);
      await loadDocuments();
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Delete this course document and its RAG vector chunks?')) return;
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleViewChunks = async (docId) => {
    try {
      const chunks = await api.getDocumentChunks(docId);
      setSelectedChunks(chunks);
      setChunkModalOpen(true);
    } catch (err) {
      alert(`Failed to load vector chunks: ${err.message}`);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={26} color="#818cf8" />
            Course Material Indexer
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Upload PDFs, DOCX, PPTX, or TXT notes. Materials are automatically parsed, chunked, and vector indexed for RAG retrieval.
          </p>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '1rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Upload size={30} color="#818cf8" />
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Upload Course Materials
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Supported Formats: <strong>PDF, DOC, DOCX, PPT, PPTX, TXT</strong>
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Select Course Subject:</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.65rem',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="Operating Systems">Operating Systems</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Data Structures">Data Structures</option>
              <option value="General Computer Science">General Computer Science</option>
            </select>
          </div>

          <label className="btn-primary" style={{ display: 'inline-flex', cursor: uploading ? 'wait' : 'pointer' }}>
            <input 
              type="file" 
              accept=".pdf,.docx,.doc,.pptx,.ppt,.txt" 
              onChange={handleFileUpload} 
              disabled={uploading}
              style={{ display: 'none' }}
            />
            {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{uploading ? 'Extracting & Indexing...' : 'Browse & Upload Document'}</span>
          </label>
        </div>
      </div>

      {/* Document List Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={20} color="#06b6d4" />
          Indexed Materials ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            No course materials uploaded yet. Use the uploader above to add your notes!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>File Name</th>
                  <th style={{ padding: '0.85rem' }}>Subject</th>
                  <th style={{ padding: '0.85rem' }}>Format</th>
                  <th style={{ padding: '0.85rem' }}>Sections/Pages</th>
                  <th style={{ padding: '0.85rem' }}>Vector Chunks</th>
                  <th style={{ padding: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCode size={16} color="#818cf8" />
                        <span>{doc.filename}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-secondary)' }}>{doc.subject}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-indigo" style={{ textTransform: 'uppercase' }}>{doc.file_type}</span>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-secondary)' }}>{doc.page_count} pages</td>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: '#06b6d4' }}>{doc.chunk_count} chunks</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-emerald">
                        <CheckCircle size={12} style={{ marginRight: '0.25rem' }} /> Processed
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleViewChunks(doc.id)}
                        >
                          <Eye size={14} /> Chunks
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }}
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vector Chunks Inspector Modal */}
      {chunkModalOpen && selectedChunks && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '2rem'
        }}>
          <div className="glass-card" style={{ width: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} color="#818cf8" />
                RAG Vector Chunks Preview ({selectedChunks.length} Chunks)
              </h3>
              <button onClick={() => setChunkModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedChunks.map((c, i) => (
                <div key={i} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.65rem', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#93c5fd', marginBottom: '0.35rem', fontWeight: 600 }}>
                    <span>Chunk #{c.chunk_index + 1} • Section: {c.section_name}</span>
                    <span>Page {c.page_number}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
