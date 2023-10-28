import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const FourierTransformNoise = ({ slope, amplitude }) => {
    const [frequencyData, setFrequencyData] = useState([]);
    
    const audioContextRef = useRef(null);
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const analyserRef = useRef(audioContextRef.current.createAnalyser());

    useEffect(() => {
        // Ensure the audio context is running
        audioContextRef.current.resume();

        const bufferSize = 4096;
        const sinCount = 10;
        var sins = [];
        var lastOut = 0.0;
        var noise = (function() {
            var node = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e) {
                var output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < sinCount; i++) {
                    sins.push(Math.random() * 2 - 1);
                }
                for (let i = 0; i < bufferSize; i++) {
                    /*  old way
                    var white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (white*0.02))/1.02;
                    //output[i] = white;
                    lastOut = output[i];
                    output[i] *= 1.5;
                    */
                    var white = Math.random() * 2 - 1;
                    output[i] = white
                    output[i] *= 0.005*amplitude**2.5;
                    //console.log("test");
                }
            }
            return node;
        })();
        
       
        

        // Connect noise to analyser and destination
        noise.connect(analyserRef.current);
        //add noise for user
        //analyserRef.current.connect(audioContextRef.current.destination);

        // Setup Analyser
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Extract frequency data from the audio source
        const updateData = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            //console.log(dataArray.length);
            //const modifiedDataArray = Array.from(dataArray).map((value, index) => Math.min(value, 255));
            setFrequencyData(Array.from(dataArray));
            requestAnimationFrame(updateData);
        }

        updateData();
        analyserRef.current.connect(audioContextRef.current.destination);
        return () => {
            noise.disconnect();
        };

    }, [slope, amplitude ]);

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
        aspectRatio: 1,
        scales: {
            y: { min: 0, max: 256 },
            x: { min: -frequencyData.length, max: frequencyData.length/1 }
        },
        animation: false
    };
    
    return <Line data={data} options={options} />;
}

export default FourierTransformNoise;
