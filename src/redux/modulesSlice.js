import { createSlice } from '@reduxjs/toolkit';

export const modulesSlice = createSlice({
  name: 'modules',
  initialState: {
    oscillator: {
      frequency: 20,
      amplitude: 1,
    },
    noise: {
      slope: 0,
      amplitude: 1,
    },
    filter1: {
      frequency: 1,
      state: "off",
    },
    filter2: {
      frequency: 1,
      state: "off",
    }
  },
  reducers: {
    setOscillatorFrequency: (state, action) => {
      state.oscillator.frequency = action.payload;
    },
    setOscillatorAmplitude: (state, action) => {
      state.oscillator.amplitude = action.payload;
    },
    setNoiseSlope: (state, action) => {
      state.noise.slope = action.payload;
    },
    setNoiseAmplitude: (state, action) => {
      state.noise.amplitude = action.payload;
    },
    setFilter1Frequency: (state, action) => {
      state.filter1.frequency = action.payload;
    },
    setFilter1State: (state, action) => {
      state.filter1.state = action.payload;
    },
    setFilter2Frequency: (state, action) => {
      state.filter2.frequency = action.payload;
    },
    setFilter2State: (state, action) => {
      state.filter2.state = action.payload;
    },
  }
});

export const { 
  setOscillatorFrequency, 
  setOscillatorAmplitude, 
  setNoiseSlope,
  setNoiseAmplitude,
  setFilter1Frequency, 
  setFilter1State,
  setFilter2Frequency,
  setFilter2State,
} = modulesSlice.actions;

export default modulesSlice.reducer;
