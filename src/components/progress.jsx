//create progress bar component that fetch data to backend and display progress bar based on the data received from backend 
//importation
import  { useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';

//fetch data from backend and display progress bar based on the data received from backend
const Progress = () => {
  const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/progress', { withCredentials: true });
                setProgress(response.data.progress);
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
    }
, []);
  return (
    <div>
      <h3>Course Progress</h3>
      <ProgressBar now={progress} label={`${progress}%`} />
    </div>
  );
}

export default Progress;
