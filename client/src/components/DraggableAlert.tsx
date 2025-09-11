import React from 'react';
import Draggable from 'react-draggable';
import { AlertCircle } from 'lucide-react';
import '../index.css';

function DraggableAlert({ message }: { message: string }) {
  return (
    <Draggable>
      <div className="glassy p-4 rounded-lg mb-2 cursor-move">
        <AlertCircle size={20} className="text-red-500 inline mr-2" />
        <span>{message}</span>
      </div>
    </Draggable>
  );
}

export default DraggableAlert;
