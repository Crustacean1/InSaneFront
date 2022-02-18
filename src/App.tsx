import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import ScannerSelection from './scanner/ScannerSelection';
import ScannerPanel from './scanner/ScannerPanel';

function App() {
  let [scannerName,setScannerName] = useState<string>("");
  return (
  <div className="main-body">
    {scannerName ? 
    <ScannerPanel scannerName={scannerName} resetScannerName={()=>{setScannerName("")}}/> :
    <ScannerSelection scannerSetter={setScannerName}/>}
  </div>
  );
}

export default App;
