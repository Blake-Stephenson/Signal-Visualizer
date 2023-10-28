import React from 'react';
import { Line } from 'react-chartjs-2';

import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const SineWave = ({ frequency, amplitude }) => {
  const dataPoints = 1000; // number of points on the graph
  const step = (2*Math.PI/(frequency*0.3  + 14)) / dataPoints;  // Adjust the step size by the frequency
  const data = {
    labels: Array.from({ length: dataPoints }, (_, i) => Math.round(i*step*1000)/1000),
    datasets: [{
      data: Array.from({ length: dataPoints }, (_, i) => amplitude * Math.sin(i*step * frequency)),
      label: 'Sine Wave',
      borderColor: '#FF5733',
      fill: false
    }]
  };
  //console.log(data)

  const options = {
    aspectRatio: 0.5,  // Adjust for portrait orientation
    scales: {
      y: {
        min: -10,
        max: 10,
      },
      x: {
        min: 0,
        max: dataPoints,  // set to dataPoints for clarity
      }
    },
    animation: false, // for better real-time updates
  };

  return <Line data={data} options={options} />;
}

export default SineWave;
