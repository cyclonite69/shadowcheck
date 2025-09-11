import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid } from 'recharts';
import '../index.css';

const data = [
  { x: 1, y: 1, value: 10 },
  { x: 2, y: 2, value: 20 },
  { x: 3, y: 3, value: 15 },
  // Add more signal data
];

function Heatmap() {
  return (
    <div className="glassy p-4 rounded-lg mt-4">
      <ScatterChart
        width={400}
        height={300}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="X" />
        <YAxis type="number" dataKey="y" name="Y" />
        <ZAxis type="number" dataKey="value" range={[50, 200]} name="Signal Strength" />
        <Scatter name="Signals" data={data} fill="#00D9E1" shape="circle" />
      </ScatterChart>
    </div>
  );
}

export default Heatmap;
