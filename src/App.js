import React, { useState } from 'react';
import './App.css'
import { useDispatch, useSelector } from 'react-redux';
import { 
  setOscillatorFrequency, 
  setOscillatorAmplitude, 
  setNoiseSlope,
  setNoiseAmplitude,
  setFilter1Frequency,
  setFilter1State, 
  setFilter2Frequency,
  setFilter2State, 
} from './redux/modulesSlice';
import { Container, Row, Col, Input, Label } from 'reactstrap';
import SineWave from './components/SineWave';
import SineWave2 from './components/SineWave2';
import FourierTransform from './components/FourierTransform';
import FourierTransform2 from './components/FourierTransform2';
import NoiseWave from './components/noiseWave';
import FourierTransformNoise from './components/FourierTransformNoise';
import Filter1FT from './components/Filter1';
import Filter1 from './components/Filter1Signal';
import CombSig from './components/CombinedSignal';
import FourierCombSig from './components/FourierCombinedSignal';


function App() {
  const { oscillator, noise, filter1, filter2 } = useSelector(state => state.modules);
  const dispatch = useDispatch();

  return (
    <Container>
      <Row className="mt-5">
        <Col className="text-center" xs="2">
          <div className="module">
            <Label>Oscillator Output vs Time</Label>
            <div style={{ height: '170px' }}>
            <SineWave2 amplitude={oscillator.amplitude} frequency={oscillator.frequency} />
            </div>
          </div>
          <div className="module">
            <Label>Noise vs Time</Label>
            <div style={{ height: '170px' }}>
              <NoiseWave slope={noise.slope} amplitude={noise.amplitude} />   
            </div>
          </div>
        </Col>
        <Col className="text-center" xs="2">
          <div className="module">
            <Label>Oscillator Output vs Frequency</Label>
            <div style={{ height: '170px' }}>
            <FourierTransform2 amplitude={oscillator.amplitude} frequency={oscillator.frequency} />
            </div>
          </div>
          <div className="module">
            <Label>Noise vs Frequency</Label>
            <div style={{ height: '170px' }}>
              <FourierTransformNoise slope={noise.slope} amplitude={noise.amplitude} />   
            </div>
          </div>
        </Col>
        <Col className="text-center" xs="2">
          <div className="module">
            <Label>Combined Signal vs Time</Label>
            <div style={{ height: '406px' }}>
              <CombSig frequency={oscillator.frequency} amplitudeS={oscillator.amplitude} slope={noise.slope} amplitudeN={noise.amplitude} />   
            </div>
          </div>

        </Col>
        <Col className="text-center" xs="2">
          <div className="module">
            <Label>Combined Signal vs Frequency</Label>
            <div style={{ height: '406px' }}>
              <FourierCombSig frequency={oscillator.frequency} amplitudeS={oscillator.amplitude} slope={noise.slope} amplitudeN={noise.amplitude} />   
            </div>
          </div>
        </Col>
        <Col className="text-center" xs="2">
          <div className="module">
            <Label>Filtered Signal vs Time   ***</Label>
            <div style={{ height: '406px' }}>
              <Filter1 filter2State={filter2.state} filter2Freq={filter2.frequency} filter1State={filter1.state} filter1Freq={filter1.frequency} frequency={oscillator.frequency} amplitudeS={oscillator.amplitude} slope={noise.slope} amplitudeN={noise.amplitude}  />   
            </div>
          </div>
        </Col> 
        <Col className="text-center" xs="2">
          <div className="module">
            <Label>Filtered Signal vs Frequency</Label>
            <div style={{ height: '406px' }}>
              <Filter1FT filter2State={filter2.state} filter2Freq={filter2.frequency} filter1State={filter1.state} filter1Freq={filter1.frequency} frequency={oscillator.frequency} amplitudeS={oscillator.amplitude} slope={noise.slope} amplitudeN={noise.amplitude}  />   
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col className="text-center" xs="4">
          <div className="module"  >
            <div>
              <Label>Oscillator</Label>
            </div>
            <div className="slider">
              <label>
                  Frequency: {oscillator.frequency} Hz .  
              </label>
              <input 
                  type="range" 
                  min="20" 
                  max="5000"  //adjust min and max
                  value={oscillator.frequency}
                  onChange={e => dispatch(setOscillatorFrequency(Number(e.target.value)))}
                  step="1"  //Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>
            <div className="slider">
              <label>
                Amplitude: {oscillator.amplitude} .  
              </label>
              <input 
                  type="range" 
                  min="0" 
                  max="10"  //adjust min and max
                  value={oscillator.amplitude}
                  onChange={e => dispatch(setOscillatorAmplitude(Number(e.target.value)))}
                  step="1"  //Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>                
          </div>

          <div className="module"  >
            <div>
              <Label>Noise</Label>
            </div>
            <div className="slider">
              <label>
                Amplitude: {noise.amplitude} .  
              </label>
              <input 
                  type="range" 
                  min="0" 
                  max="10"  //adjust min and max
                  value={noise.amplitude}
                  onChange={e => dispatch(setNoiseAmplitude(Number(e.target.value)))}
                  step="1"  //Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>                
          </div>
        </Col>
        <Col className="text-center" xs="4">
          <div className="module">
              <div>
                <Label>Bandpass Filter  :</Label>
            
              <label>
                Enable:
                <input
                    type="checkbox"
                    checked={filter2.state === "on"}
                    onChange={e => dispatch(setFilter2State(e.target.checked ? "on" : "off"))}
                />
              </label>
            </div>
            <div className="slider">
              <label>
                Frequency: {filter2.frequency} Hz .
              </label>
              <input 
                  type="range" 
                  min="10"  // Adjust based on your desired range for the filter frequency
                  max="10000"  // Adjust based on your desired range for the filter frequency
                  value={filter2.frequency}
                  onChange={e => dispatch(setFilter2Frequency(Number(e.target.value)))}
                  step="1"  // Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>
          </div>
        </Col>
        <Col className="text-center" xs="4">
          <div className="module">
            <div>
                <Label>Lowpass Filter  :</Label>
            
              <label>
                Enable:
                <input
                    type="checkbox"
                    checked={filter1.state === "on"}
                    onChange={e => dispatch(setFilter1State(e.target.checked ? "on" : "off"))}
                />
              </label>
            </div>
            <div className="slider">
              <label>
                Frequency: {filter1.frequency} Hz .
              </label>
              <input 
                  type="range" 
                  min="10"  // Adjust based on your desired range for the filter frequency
                  max="10000"  // Adjust based on your desired range for the filter frequency
                  value={filter1.frequency}
                  onChange={e => dispatch(setFilter1Frequency(Number(e.target.value)))}
                  step="1"  // Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;


/*
            <div className="slider">
              <label>
                  Slope: {noise.slope} .  
              </label>
              <input 
                  type="range" 
                  min="-10" 
                  max="10"  //adjust min and max
                  value={noise.slope}
                  onChange={e => dispatch(setNoiseSlope(Number(e.target.value)))}
                  step="1"  //Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>

                      <div>
              <Label>Filter 1</Label>
          </div>
            <div className="slider">
              <label>
                Frequency: {filter1.frequency} Hz .
              </label>
              <input 
                  type="range" 
                  min="20"  // Adjust based on your desired range for the filter frequency
                  max="2000"  // Adjust based on your desired range for the filter frequency
                  value={filter1.frequency}
                  onChange={e => dispatch(setFilter1Frequency(Number(e.target.value)))}
                  step="1"  // Adjust this for how fine-grained you want the slider adjustments to be.
              />
            </div>
            */


