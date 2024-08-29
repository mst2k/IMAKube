import { useState } from 'react';
import './App.css';

function App() {
  const [number, setNumber] = useState<number>(0);
  const [isEven, setIsEven] = useState<boolean | undefined>();

  async function getData(num: number) {
    const url = `/iseven?number=${num}`;
    const response = await fetch(url);
    const data = await response.json();
    setIsEven(data.is_even);
  }

  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(parseInt(e.target.value));
  };

  return (
    <>
      <input type='number' value={number} onChange={handleChangeNumber} /> 
      <button onClick={() => getData(number)}>Check if the number is even</button>
      {isEven !== undefined && (
        <p>The number is {isEven ? 'even' : 'odd'}</p>
      )}
    </>
  );
}

export default App;
