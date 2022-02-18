import React, { useState, useEffect } from 'react';
import apiFetcher from '../api/Api';
import Loader from '../loader/Loader';
import './ScannerSelection.css'

type ScannerSetter = (str: string) => void;

interface ScannerSelectionProps {
    scannerSetter: ScannerSetter;
}

interface ScannerList {
    scanners: string[];
    loaded: "unloaded" | "loaded" | "refreshing";
}

interface InnerListProps {
    scanners: string[]
    refreshCallback: () => void;
    scannerSelectionCallback: (scannerName: string) => void;
}

function handleError(error: any) {
    alert(error);
}

function InnerFunctionSelection(props: InnerListProps) {
    let key = 1;
    return <div className="inner-scanner-list">
        {props.scanners.map((scanner) =>
            <span key={key++} className="scanner-item"
                onClick={() => props.scannerSelectionCallback(scanner)}>
                {scanner}
            </span>)}
        <span className="scanner-refresh" onClick={props.refreshCallback}></span>
    </div>
}

function ScannerSelection(props: ScannerSelectionProps) {
    let [scannerList, setScannerList] = useState<ScannerList>({ scanners: [], loaded: "unloaded" });
    useEffect(() => {
        if (scannerList.loaded !== "unloaded") { return; }
        apiFetcher.fetchScannerList().then((newList: string[]) => {
            setScannerList({ scanners: newList, loaded: "loaded" });
        }, (error: string) => { handleError(error); })
    });

    let refreshCallback = () => {
        setScannerList({ scanners: [], loaded: "refreshing" });
        apiFetcher.refreshScannerList().
            then(() => {
                setScannerList({ scanners: [], loaded: "unloaded" });
            }, (error: string) => { handleError(error) });
    }

    return <div className="scanner-selection">
        <Loader
            component={<InnerFunctionSelection scanners={scannerList.scanners} 
            refreshCallback={refreshCallback} scannerSelectionCallback={props.scannerSetter}/>}
            condition={scannerList.loaded !== "loaded"}
        />

    </div>
}

export default ScannerSelection;