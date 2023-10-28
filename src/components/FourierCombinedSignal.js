import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const FourierCombSig = ({ frequency, amplitudeS, slope, amplitudeN }) => {


    const [frequencyData, setFrequencyData] = useState([]);
    
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
        const gainNode = audioContextRef.current.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

        gainNode.gain.value = 0.01*amplitudeS;


        var bufferSize = 4096;
        var lastOut = 0.0;
        var noise = (function() {
            var node = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e) {
                var output = e.outputBuffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    //output[i] = (lastOut + (white*0.02))/1.02;
                    //output[i] = white;
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
        
        // Connect oscillator to analyser and destination
        //oscillator.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        // Start oscillator
        oscillator.start();

        // Connect  noise to analyser and destination
        noise.connect(analyserRef.current);
        //analyserRef.current.connect(audioContextRef.current.destination);

        // Setup Analyser
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Extract frequency data from the audio source
        const updateData = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            setFrequencyData(Array.from(dataArray));
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
        labels: Array.from({ length: frequencyData.length/2 }, (_, i) => (i * audioContextRef.current.sampleRate / analyserRef.current.fftSize).toFixed(2)),
        datasets: [{
            data: frequencyData,
            label: 'combined spectrum',
            borderColor: '#007BFF',
            fill: false
        }]
    };

    const options = {
        aspectRatio: 0.43,
        scales: {
            y: { min: 0, max: 256 },  // 8-bit unsigned data, hence 0 to 255
            x: { min: 0, max: frequencyData.length / 3.5 }
        },
        animation: false
    };
    
    return <Line data={data} options={options} />;
}

export default FourierCombSig;
