import React, { useState, useEffect } from 'react';
import './Option.css';
import apiFetcher, { GetOptionDto } from '../api/Api';

interface OptionProps {
    optionDto: GetOptionDto;
    optionChangeCallback: () => void;
    scannerName: string;
}

function ListOption(props: { option: OptionProps }) {
    let key: number = 0;
    const option = props.option.optionDto;
    let setOption = (value: string) => {
        apiFetcher.setScannerOption(props.option.scannerName,
            { "optionId": parseInt(option.optionId, 10), "value": value }).
            then((success) => {
                if (!success) { console.log("Failed to fetch option"); }
                props.option.optionChangeCallback();
            })
    }

    return <div className="option list-option">
        <div className="option list-option option-head">
            <span className="option-title">{option.title}</span>
            <select onChange={(e) => { setOption(e.currentTarget.value) }} value={option.value}>
                {option["value_range"].map((x) => (<option key={key++} value={x}>{x}</option>))}
            </select></div>
        <div className="option-desc">
            <p>{option.desc}</p>
        </div>
    </div>
}


function RangeOption(props: { option: OptionProps }) {
    const option = props.option.optionDto;
    const [minVal, maxVal] = [parseInt(option.value_range[0], 10), parseInt(option.value_range[1], 10)];
    const isDisabled: boolean = (!option.value)

    let [value, setValue] = useState(parseInt(option.value, 10));

    useEffect(() => {
        setValue(parseInt(option.value, 10));
    }, [props.option.optionDto.value])

    let setOption = (newValue: string) => {
        apiFetcher.setScannerOption(props.option.scannerName, { optionId: parseInt(option.optionId, 10), value: newValue }).
            then((result: boolean) => {
                setValue(Number.NaN);
                if (!result) { console.log("Failed to set option") }
                props.option.optionChangeCallback();
            })
    }

    let rangeInput = (<input type="range" min={minVal} max={maxVal}
        value={isDisabled ? "" : (Number.isNaN(value) ? option.value : value)} disabled={isDisabled}
        onPointerUp={(e) => { setOption(e.currentTarget.value) }}
        onChange={(e) => { setValue(parseInt(e.currentTarget.value, 10)) }} />)

    return <div className="option range-option">
        <div className="option-head">
            <span className="option-title">{option.title}</span>
            {rangeInput}
            <span className="range-option option-value">
                {isDisabled ? "N/A" : (Number.isNaN(value) ? option.value : value).toString()}</span>
        </div>
        <div className="option-desc">
            <p>{option.desc}</p>
        </div>
    </div>
}


function GenericOption(props: { data: OptionProps }) {
    switch (props.data.optionDto.constraint) {
        case "List":
            return <ListOption option={props.data} />
        case "Range":
            return <RangeOption option={props.data} />
        default:
            return <div className="wtf"></div>
    }
}

export default GenericOption;
export type { OptionProps };