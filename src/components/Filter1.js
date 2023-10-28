import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const Filter1FT = ({ frequency, amplitudeS, slope, amplitudeN , filter1Freq, filter1State, filter2Freq, filter2State}) => {
    const [frequencyData, setFrequencyData] = useState([]);
    
    const audioContextRef = useRef(null);
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const analyserRef = useRef(audioContextRef.current.createAnalyser());

    useEffect(() => {
        // Ensure the audio context is running
        audioContextRef.current.resume();
    
        // Create Oscillator and GainNode
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
    
        // Configure the oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    
        // Configure the gain (amplitude) of the oscillator
        gainNode.gain.value = 0.01 * amplitudeS;
    
        // Create white noise generator
        const bufferSize = 4096;
        const sinCount = 10;
        var sins = [];
        var lastOut = 0.0;
        var noise = (function () {
            var node = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
    
            // Process the audio data
            node.onaudioprocess = function (e) {
                var output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < sinCount; i++) {
                    sins.push(Math.random() * 2 - 1);
                }
                for (let i = 0; i < bufferSize; i++) {
                    var white = Math.random() * 2 - 1;
                    output[i] = white;
                    output[i] *= 0.005 * amplitudeN ** 2.5;
                }
            };
            return node;
        })();
    
        // Connect the oscillator to the GainNode
        oscillator.connect(gainNode);
        // Connect GainNode to the audio analyzer
        gainNode.connect(analyserRef.current);
    
        // Create a low-pass and bandpass filter
        var lowPassFilter = audioContextRef.current.createBiquadFilter();
        var bandPassFilter = audioContextRef.current.createBiquadFilter();
    
        // Configure the low-pass filter
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.setValueAtTime(filter1Freq, audioContextRef.current.currentTime);
        lowPassFilter.Q.setValueAtTime(1, audioContextRef.current.currentTime);
    
        // Configure the bandpass filter
        bandPassFilter.type = 'bandpass';
        bandPassFilter.frequency.setValueAtTime(filter2Freq, audioContextRef.current.currentTime);
        bandPassFilter.Q.setValueAtTime(30, audioContextRef.current.currentTime);
    
        // Connect white noise to low-pass and bandpass filter based on filter state
        if (filter1State == "on") {
            noise.connect(lowPassFilter);
        }
        if (filter2State == "on") {
            noise.connect(bandPassFilter);
        }
    
        // Connect filters to the audio analyzer
        lowPassFilter.connect(analyserRef.current);
        bandPassFilter.connect(analyserRef.current);
    
        // Start the oscillator
        oscillator.start();
    
        // Connect noise to the audio analyzer
        noise.connect(analyserRef.current);
    
        // Setup Analyser for frequency analysis
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
    
        // Extract frequency data from the audio source and update the state
        const updateData = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            setFrequencyData(Array.from(dataArray));
            requestAnimationFrame(updateData);
        };
    
        // Start the frequency data update loop
        updateData();
    
        // Connect the audio analyzer to the audio destination
        analyserRef.current.connect(audioContextRef.current.destination);
    
        // Cleanup and disconnect audio nodes when component unmounts
        return () => {
            noise.disconnect();
            lowPassFilter.disconnect();
            bandPassFilter.disconnect();
            oscillator.stop();
            gainNode.disconnect();
        };
    }, [frequency, amplitudeS, slope, amplitudeN, filter1Freq, filter1State, filter2Freq, filter2State]);
    

    // Data for the chart
    const data = {
        labels: Array.from({ length: frequencyData.length/2 }, (_, i) => (i * audioContextRef.current.sampleRate / analyserRef.current.fftSize).toFixed(2)),
        datasets: [{
            data: frequencyData,
            label: 'Frequency Spectrum',
            borderColor: '#007BFF',
            fill: false
        }]
    };

    const options = {
        aspectRatio: 0.43,
        scales: {
            y: { min: 0, max: 256 },
            x: { min: -frequencyData.length, max: frequencyData.length/1 }
        },
        animation: false
    };
    
    return <Line data={data} options={options} />;
}

export default Filter1FT;
