import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';





// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const SineWave2 = ({ frequency, amplitude }) => {
    //time check1!!
    const D = new Date();
    const Ds = D.getMilliseconds()
    //console.log(Ds);

    const [waveData, setWaveData] = useState([]);
    
    const audioContextRef = useRef(null);
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const analyserRef = useRef(audioContextRef.current.createAnalyser());

    useEffect(() => {
        // Create Oscillator
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

        gainNode.gain.value = 0.1*amplitude;

        // Connect the oscillator to the GainNode
        oscillator.connect(gainNode); 
        // Connect GainNode to further processing or destination
        gainNode.connect(analyserRef.current); 

        // Connect oscillator to analyser and destination
        //oscillator.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        // Start oscillator
        oscillator.start();

        // Setup Analyser
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Extract data from the audio source
        const updateData = () => {
            analyserRef.current.getByteTimeDomainData(dataArray);
            setWaveData(Array.from(dataArray));
            requestAnimationFrame(updateData);
        }

        updateData();

        return () => {
            oscillator.stop();
            gainNode.disconnect();
        };

    }, [frequency, amplitude]);
    

    // Data for the chart
    const data = {
        labels: Array.from({ length: waveData.length }, (_, i) => Math.round(i / audioContextRef.current.sampleRate *100000)/100000),
        datasets: [{
            data: waveData,
            label: 'Sine Wave',
            borderColor: '#FF5733',
            fill: false
        }]
    };

    const options = {
        aspectRatio: 1,
        scales: {
            y: { min: 0, max: 256 },  // 8-bit unsigned data, hence 0 to 255
            x: { min: 0, max: waveData.length/20 }
        },
        animation: false
    };
    
    return <Line data={data} options={options} />;
}

export default SineWave2;
