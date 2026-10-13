import { useState, useEffect } from 'react';
import { coursesAPI, lessonsAPI, quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import './AdminLessons.css';

const AdminLessons = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [chapter, setChapter] = useState(1);
  const [title, setTitle] = useState('');
  const [aiProvider, setAiProvider] = useState('gemini');
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [createdLesson, setCreatedLesson] = useState(null);
  const [pdfStats, setPdfStats] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await coursesAPI.getAll();
        const list = res.data.data.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse(list[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load courses');
        console.error(err);
      }
    };
    loadCourses();
  }, [toast]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !title || (!file && !pdfUrl)) {
      toast.error('Please fill in all fields and provide either a PDF file or a PDF URL.');
      return;
    }

    const formData = new FormData();
    formData.append('courseId', selectedCourse);
    formData.append('chapter', chapter);
    formData.append('title', title);
    formData.append('aiProvider', aiProvider);
    if (pdfUrl) {
      formData.append('pdfUrl', pdfUrl);
    }
    if (file) {
      formData.append('pdf', file);
    }

    setUploading(true);
    try {
      const res = await lessonsAPI.upload(formData);
      const newLesson = res.data.data.lesson;
      const stats = res.data.data.stats;
      setCreatedLesson(newLesson);
      setPdfStats(stats);
      toast.success('🎉 PDF parsed, compressed & AI study notes generated!');
      setTitle('');
      setFile(null);
      setPdfUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload lesson');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!createdLesson) return;
    setGeneratingQuiz(true);
    try {
      await quizzesAPI.create({
        lessonId: createdLesson._id,
        title: `Quiz: ${createdLesson.title}`,
        passingScore: 50,
      });
      toast.success('🎯 AI Quiz generated successfully for this chapter!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="admin-lessons-container">
      <h2>📤 Admin Panel — PDF Lesson & AI Quiz Manager</h2>
      <p className="admin-subtitle">
        Upload a course PDF to automatically extract clean text, compress content into AI study notes, and generate an interactive quiz.
      </p>

      <form className="admin-upload-form" onSubmit={handleUpload}>
        <div className="form-group">
          <label>Target Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Chapter Number</label>
            <input
              type="number"
              min="1"
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group flex-2">
            <label>Lesson Title</label>
            <input
              type="text"
              placeholder="e.g. Introduction to Fractions & Decimals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>AI Provider</label>
          <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
            <option value="gemini">Google Gemini</option>
            <option value="anthropic">Anthropic Claude</option>
          </select>
        </div>

        <div className="form-group">
          <label>PDF File</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required={!pdfUrl}
          />
        </div>

        <div className="form-group">
          <label>PDF URL (optional, if file is kept on external host)</label>
          <input
            type="url"
            placeholder="https://example.com/lesson.pdf"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
        </div>

        <button type="submit" className="upload-submit-btn" disabled={uploading}>
          {uploading ? 'Parsing PDF, Cleaning Text & Compressing...' : 'Upload & Generate AI Courseware'}
        </button>
      </form>

      {createdLesson && (
        <div className="admin-result-box">
          <h3>✅ Lesson Created: {createdLesson.title}</h3>

          {pdfStats && (
            <div className="admin-stats-pills" style={{ display: 'flex', gap: '10px', margin: '12px 0', flexWrap: 'wrap' }}>
              <span className="stat-pill" style={{ background: '#f3e8ff', color: '#7c3aed', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
                📄 {pdfStats.pageCount || 1} Pages
              </span>
              <span className="stat-pill" style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
                📝 {pdfStats.wordCount?.toLocaleString() || 0} Words
              </span>
              <span className="stat-pill" style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
                ⏱️ ~{pdfStats.readingTimeMinutes || 5} min reading time
              </span>
            </div>
          )}

          {createdLesson.studyNotes?.overview && (
            <div style={{ margin: '12px 0', padding: '12px', background: '#faf5ff', borderRadius: '10px' }}>
              <p><strong>Overview:</strong> {createdLesson.studyNotes.overview}</p>
              {createdLesson.studyNotes.keyPoints?.length > 0 && (
                <div>
                  <strong>Key Points:</strong>
                  <ul>
                    {createdLesson.studyNotes.keyPoints.slice(0, 4).map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="summary-preview">{createdLesson.summary}</div>

          <button
            className="generate-quiz-btn"
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
          >
            {generatingQuiz ? 'Creating AI Quiz...' : '✨ Re-generate AI Quiz For This Lesson'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;
