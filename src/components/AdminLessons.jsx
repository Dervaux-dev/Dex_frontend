import { useState, useEffect } from 'react';
import { coursesAPI, lessonsAPI, quizzesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import './AdminLessons.css';

const AdminLessons = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [chapter, setChapter] = useState(1);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [createdLesson, setCreatedLesson] = useState(null);
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
      setCreatedLesson(newLesson);
      toast.success('🎉 PDF Lesson uploaded & AI summary generated!');
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
        Upload a course PDF to automatically extract text, generate AI study notes, and create an AI quiz.
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
              placeholder="e.g. Introduction to Variables & Functions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
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
          <label>PDF URL (optional, if file is kept on your phone)</label>
          <input
            type="url"
            placeholder="https://example.com/lesson.pdf"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
        </div>

        <button type="submit" className="upload-submit-btn" disabled={uploading}>
          {uploading ? 'Processing PDF & Extracting Text...' : 'Upload & Generate AI Summary'}
        </button>
      </form>

      {createdLesson && (
        <div className="admin-result-box">
          <h3>✅ Lesson Created: {createdLesson.title}</h3>
          <p><strong>AI Summary Preview:</strong></p>
          <div className="summary-preview">{createdLesson.summary}</div>

          <button
            className="generate-quiz-btn"
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
          >
            {generatingQuiz ? 'Creating AI Quiz...' : '✨ Generate AI Quiz For This Lesson'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;
