import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import FFT from 'fft-js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const FourierTransform = ({ frequency, amplitude }) => {
  const dataPoints = 44100/2;
  const sampleRate = 44100;
  const step = (1/dataPoints);
  //make sine data
  let sineData = Array.from({ length: dataPoints }, (_, i) => amplitude * Math.sin(2 * Math.PI * frequency* i * step));
  //padd with zeros to make power of 2 len
  const targetLength = Math.pow(2, Math.ceil(Math.log2(sineData.length)));
  while (sineData.length < targetLength) {
    sineData.push(0);
  }
  //add complex component
  let complexData = sineData.map(value => [value, 0]);

  // Calculate the Fourier Transform
  let phasors = FFT.fft(complexData);
  const magnitudes = FFT.util.fftMag(phasors);

  const data = {
    labels: Array.from({ length: dataPoints/2 }, (_, i) => ((i*0.67).toFixed(2))),
    datasets: [{
      data: magnitudes,
      label: 'Fourier Transform',
      borderColor: '#007BFF',
      fill: false
    }]
  };

  const options = {
    aspectRatio: 0.5,
    scales: {
      y: {
        min: 0,
        max: Math.max(...magnitudes),
      },
      x: {
        min: 0,
        max: 17000 //dataPoints / 2,  // Only half is meaningful due to Nyquist theorem
      }
    },
    animation: false,
  };

  return <Line data={data} options={options} />;
}

export default FourierTransform;
