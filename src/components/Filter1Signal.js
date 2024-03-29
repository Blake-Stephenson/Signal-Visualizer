import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

// Register the components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const Filter1 = ({ frequency, amplitudeS, slope, amplitudeN , filter1Freq, filter1State, filter2Freq, filter2State}) => {
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
        const gainNode = audioContextRef.current.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

        gainNode.gain.value = 0.1*amplitudeS;

        const bufferSize = 4096;

        var lastOut = 0.0;
        var noise = (function() {
            var node = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e) {
                var output = e.outputBuffer.getChannelData(0);
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
                    output[i] *= 0.005*amplitudeN**2.5;
                    //console.log("test");
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

        // Create a low-pass and bandpass filter
        var lowPassFilter = audioContextRef.current.createBiquadFilter();
        var bandPassFilter = audioContextRef.current.createBiquadFilter();
        
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.setValueAtTime(filter1Freq, audioContextRef.current.currentTime); // example cutoff at 1000Hz
        lowPassFilter.Q.setValueAtTime(1, audioContextRef.current.currentTime); // change attenuation
        
        bandPassFilter.type = 'bandpass';
        bandPassFilter.frequency.setValueAtTime(filter2Freq, audioContextRef.current.currentTime); // example cutoff at 1000Hz
        bandPassFilter.Q.setValueAtTime(30, audioContextRef.current.currentTime); // change attenuation
        
        
        //console.log(filterFreq);
        // Connect brown noise to low-pass and bandpass filter
        if(filter1State == "on"){
            noise.connect(lowPassFilter);
        }
        if(filter2State == "on"){
            noise.connect(bandPassFilter);
        }
        // Connect low-pass and bandpass filter to analyser
        lowPassFilter.connect(analyserRef.current);
        bandPassFilter.connect(analyserRef.current);

        // Start oscillator
        oscillator.start();

        // Connect noise to analyser and destination
        noise.connect(analyserRef.current);
        //Uncomment to add noise for user
        //analyserRef.current.connect(audioContextRef.current.destination);

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
        analyserRef.current.connect(audioContextRef.current.destination);
        return () => {
            noise.disconnect();
            lowPassFilter.disconnect();
            bandPassFilter.disconnect();
            oscillator.stop();
            gainNode.disconnect();
        };

    }, [frequency, amplitudeS, slope, amplitudeN , filter1Freq, filter1State, filter2Freq, filter2State ]);

    // Data for the chart
    const data = {
        labels: Array.from({ length: waveData.length }, (_, i) => Math.round(i / audioContextRef.current.sampleRate *100000)/100000),
        datasets: [{
            data: waveData,
            label: 'fitlered signal',
            borderColor: '#FF5733',
            fill: false
        }]
    };

    const options = {
        aspectRatio: 0.43,
        scales: {
            y: { min: 0, max: 256 },
            x: { min: 0, max: waveData.length/20 }
        },
        animation: false
    };
    
    return <Line data={data} options={options} />;
}

export default Filter1;
