import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { addDocument } from '../utils/firestoreWrites';

const InputField: React.FC = () => {
  const [input, setInput] = useState('');

  const debouncedSave = useCallback(
    debounce(async (value: string) => {
      try {
        await addDocument('yourCollection', { field: value });
      } catch (error) {
        console.error(error.message);
      }
    }, 1000), // 1 second debounce
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSave(e.target.value);
  };

  return <input type="text" value={input} onChange={handleChange} />;
};

export default InputField; 