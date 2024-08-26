import React, { useState } from 'react';

const NumberSelector: React.FC = () => {
  // State to hold the selected value
  const [selectedNumber, setSelectedNumber] = useState<number | undefined>(undefined);

  // Handler function to update state when the selection changes
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNumber(Number(event.target.value));
  };

  return (
    <div>
      <label htmlFor="number-select">Select a rating from 0 to 5:</label>
      <select
        id="number-select"
        value={selectedNumber ?? ''}
        onChange={handleChange}
      >
        <option value="" disabled>Select a rating</option>
        {[0, 1, 2, 3, 4, 5].map(num => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      {selectedNumber !== undefined && (
        <p>Selected number: {selectedNumber}</p>
      )}
    </div>
  );
};

export default NumberSelector;
