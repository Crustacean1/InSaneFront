import React, { useState, useEffect } from 'react';
import './ScannerPanel.css';
import apiFetcher, { GetOptionDto, ScanStatus } from "../api/Api";
import OptionList from './OptionList';
import Loader from '../loader/Loader';

function ProgressBar(props: { scanStatus: ScanStatus }) {
    const colorMap = {
        "Ready": "grey",
        "Scanning": "black",
        "Completed": "blue",
        "Failed": "red",
        "Writing": "brown",
        "Initializing" : "grey"
    }
    const innerBar = props.scanStatus.status === "Scanning";
    return <span className="outer-progress-bar" style={{ "backgroundColor": `${colorMap[props.scanStatus.status]}` }}>
        <span className="inner-progress-bar" style={{ "width": `${props.scanStatus.progress}%`, "visibility": (innerBar ? undefined : "hidden") }}>
        </span>
        <span className="progress-status">{props.scanStatus.status}</span>
    </span >
}

function handleError(error: Error) {
    alert(error.name + " : " + error.message);
}

function ScannerPanel(props: { scannerName: string, resetScannerName: () => void }) {

    let [options, setOptions] = useState<GetOptionDto[]>([]);
    let [loaded, setLoaded] = useState<boolean>(false);
    let [scanStatus, setScanStatus] = useState<ScanStatus>({ "progress": 0, "status": "Ready" });
    const progressCheckTimeout = 1000;//in ms

    useEffect(() => {
        if (!loaded) {
            optionChangeCallback();
            progressCheckCallback();
        }
    },[props.scannerName]);

    let optionChangeCallback = () => {
        apiFetcher.getScannerOptions(props.scannerName)
            .then((data: any) => { setOptions(data["options"]); setLoaded(true); },
                (error) => { handleError(error); })
    }

    let optionsReset = () => {
        setLoaded(false);
        apiFetcher.setScannerOption(props.scannerName, {})
            .then((success) => {
                if (!success) { console.log("Failed to reset options: " + success) }
                optionChangeCallback();
            }, (error) => { handleError(error); });
    }
    let refreshScanStatus = () =>{
        setTimeout(progressCheckCallback,progressCheckTimeout);
    }

    let progressCheckCallback = () => {
        apiFetcher.getScanStatus(props.scannerName)
            .then((status) => {
                switch (status.status) {
                    case "Completed":
                        let newTab = window.open(apiFetcher.getDownloadLink(props.scannerName) + "/scan", '_blank');
                        if (newTab) {
                            newTab.focus();
                        }
                        break;
                    case "Failed":
                        alert("Scanner couldn't scan image, try again later");
                        break;
                    case "Initializing":
                    case "Scanning":
                    case "Writing":
                        refreshScanStatus();
                        break;
                    default:
                }
                setScanStatus(status);
            })
    }

    let startScanning = () => {
        apiFetcher.startScanning(props.scannerName)
            .then((success) => {
                if (!success) { alert("Couldn't start scanning"); return; }
                progressCheckCallback();
            }, (error) => {
                handleError(error);
            })
    }

    return (<div className="scanner-panel">
        <header>
            <span className="scanner-exit active-element" onClick={props.resetScannerName}></span>
            <h1>{props.scannerName}</h1>
            <ProgressBar scanStatus={scanStatus} />
            <div className="scanner-commands">
                <span className="option-reload active-element" onClick={() => { setLoaded(false); optionChangeCallback() }}>Reload</span>
                <span className="scan-start active-element" onClick={startScanning}>Scan</span>
                <span className="option-reset active-element" onClick={optionsReset}>Reset</span>
            </div>
        </header>
        <Loader component={
            <OptionList scannerName={props.scannerName} optionChangeCallback={optionChangeCallback} options={options} />} condition={!loaded} />

    </div>);
}

export default ScannerPanel;