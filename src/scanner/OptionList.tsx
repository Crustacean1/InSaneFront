import React from 'react';
import './OptionList.css';
import { GetOptionDto } from '../api/Api';
import GenericOption, { OptionProps } from './Option';

interface OptionGroupDto {
    name: string;
    scannerName: string;
    suboptions: GetOptionDto[];
}

interface OptionGroupProps {
    group: OptionGroupDto;
    scannerName: string;
    optionChangeCallback: () => void;
}

function OptionGroup(props: OptionGroupProps) {
    let groupKey = 0;
    return (
        <div className="option-group">
            <h2>{props.group.name}</h2>
            {props.group.suboptions.map(
                (suboption) =>
                    <GenericOption key={groupKey++} data={{
                        optionChangeCallback: props.optionChangeCallback,
                        optionDto: suboption,
                        scannerName: props.scannerName
                    }} />)}
        </div>);
}

interface OptionListProps {
    options: GetOptionDto[];
    scannerName: string;
    optionChangeCallback: () => void
}

function OptionList(props: OptionListProps) {

    let groups: OptionGroupDto[] = [];

    for (let option of props.options) {
        if (option.type === "Group") {
            groups.push({ scannerName: props.scannerName, name: option.title, suboptions: [] });
        } else {
            groups[groups.length - 1].suboptions.push(option);
        }
    }

    let groupKey = 0;
    return (<div className="option-list">
        {groups.map((group) =>
            <OptionGroup key={groupKey++} scannerName={props.scannerName} group={group} optionChangeCallback={props.optionChangeCallback} />)}
    </div>);
}

export default OptionList;