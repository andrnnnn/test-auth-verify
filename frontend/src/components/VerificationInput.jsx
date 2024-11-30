import { useRef, useState } from 'react';

function VerificationInput({ onComplete, isDisabled }) {
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    if (value.length <= 1) {
      const newCodes = [...codes];
      newCodes[index] = value;
      setCodes(newCodes);
      
      if (value && index < 5) {
        inputRefs[index + 1].current.focus();
      }

      // Cek jika semua kode terisi
      if (newCodes.every(code => code !== '')) {
        onComplete(newCodes.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="verification-code-container">
      {codes.map((code, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          maxLength="1"
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="verification-input"
          disabled={isDisabled}
        />
      ))}
    </div>
  );
}

export default VerificationInput; 