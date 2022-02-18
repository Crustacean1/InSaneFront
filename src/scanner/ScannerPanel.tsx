import React, { useState, useEffect } from 'react';
import './ScannerPanel.css';
import apiFetcher, { GetOptionDto } from "../api/Api";
import OptionList from './OptionList';
import Loader from '../loader/Loader';

function ListOption(props: { option: GetOptionDto }) {
    return <div></div>;
}
function RangeOption(props: { option: GetOptionDto }) {
    return <div></div>;
}
function NoneOption(props: { option: GetOptionDto }) {
    return <div></div>;
}
function ScannerOption(props: { option: GetOptionDto }) {
    switch (props.option.type) {
        case "List":
            return <ListOption option={props.option} />
        case "Range":
            return <RangeOption option={props.option} />
        case "None":
            return <NoneOption option={props.option} />
    }
}


function ScannerPanel(props: { scannerName: string, resetScannerName: () => void }) {

    let [options, setOptions] = useState<GetOptionDto[]>([]);
    let [loaded, setLoaded] = useState<boolean>(false);

    let optionChangeCallback = () => {
        apiFetcher.getScannerOptions(props.scannerName).
            then((data: any) => { setOptions(data["options"]); setLoaded(true); },
                (error) => { alert("Couldn't fetch scanner options: " + error) })
    }

    useEffect(() => {
        if (loaded) { return; }
        optionChangeCallback();
    })

    return (<div className="scanner-panel">
        <header>
            <span className="scanner-exit" onClick={props.resetScannerName}></span>
            <h1>{props.scannerName}</h1>
            <div className="scanner-commands">
                <span className="scan-start">Scan</span>
                <span className="option-reset">Reset</span>
            </div>
        </header>
        <Loader component={
            <OptionList scannerName={props.scannerName} optionChangeCallback={optionChangeCallback} options={options} />} condition={!loaded} />

    </div>);
}

export default ScannerPanel;