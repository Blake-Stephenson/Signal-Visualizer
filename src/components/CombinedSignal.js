import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const CombSig = ({ frequency, amplitudeS, slope, amplitudeN }) => {


    const [waveData, setWaveData] = useState([]);
    
    const audioContextRef = useRef(null);
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const analyserRef = useRef(audioContextRef.current.createAnalyser());

    useEffect(() => {
        // Ensure the audio context is running
        audioContextRef.current.resume();

        // Create Oscillator
        const oscillator = audioContextRef.current.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        // Create Gain node
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.1*amplitudeS;
        // Create white noise
        var bufferSize = 4096;
        var lastOut = 0.0;
        var noise = (function() {
            var node = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e) {
                var output = e.outputBuffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    var white = Math.random() * 2 - 1;
                    output[i] = white
                    output[i] *= 0.005*amplitudeN**2.5;
                }
            }
            return node;
        })();

        // Connect the oscillator to the GainNode
        oscillator.connect(gainNode); 
        // Connect GainNode to further processing or destination
        gainNode.connect(analyserRef.current); 
        
        // Connect oscillator to destination
        analyserRef.current.connect(audioContextRef.current.destination);

        // Start oscillator
        oscillator.start();

        // Connect  noise to analyser and destination
        noise.connect(analyserRef.current);

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
            noise.disconnect();
            oscillator.stop();
            gainNode.disconnect();
        };

    }, [frequency, amplitudeS, slope, amplitudeN]);
    
    // Data for the chart
    const data = {
        labels: Array.from({ length: waveData.length }, (_, i) => Math.round(i / audioContextRef.current.sampleRate * 100000) / 100000),
        datasets: [{
            data: waveData,
            label: 'combined Noise',
            borderColor: '#FF5733',
            fill: false
        }]
    };

    const options = {
        aspectRatio: 0.43,
        scales: {
            y: { min: 0, max: 256 },  // 8-bit unsigned data, hence 0 to 255
            x: { min: 0, max: waveData.length / 20 }
        },
        animation: false
    };
    
    return <Line data={data} options={options} />;
}

export default CombSig;
