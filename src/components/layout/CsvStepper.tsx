import React from 'react'
import CSVReader from "react-csv-reader";
import Table from '../layout/Table';

const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "_")
  };

const steps = ['Upload your file.', 'Select data to import.', 'Map your data.', 'Review and import data.']

export default function CsvStepper({
    handleForce, 
    step, 
    data, 
    columns, 
    availableColumns, 
    header, 
    onSelectedData, 
    mappedColumn, 
    doneMapping,
    startAgain,
    templateLink
}) {
    return (
        <section className="section">
        <div className="container">
        <ul className="steps has-content-centered">
        {steps.map((text, index) => (
            <li key={index} className={`steps-segment ${step === index + 1 ? 'is-active' : ''} `}>
                <span className="steps-marker"></span>
                <div className="steps-content">
                <p className="is-size-4">Step {index + 1}</p>
                <p>{text}</p>
                </div>
            </li>
        ))}
      </ul>
      <div className={`${step !== 1 ? 'is-hidden' : ''}`}>
        <div className="content">
        <CSVReader
                cssClass="level"
                label="Select CSV with Skills information"
                cssLabelClass="header level-left"
                cssInputClass="level-right"
                onFileLoaded={handleForce}
                parserOptions={papaparseOptions}
                />
        <p>Click <a href={templateLink} download>here</a> to download an Excel template. When uploading a csv made with this template, you will skip step 2 and 3.</p>
        </div>
       </div>
       <div className={`${step % 2 === 1 ? 'is-hidden' : ''}`}>
       <Table 
                data={data}
                columns={columns}
                header={header}
                onSelectMultiple={onSelectedData}
                selectMultipleButtonText={'Import selected records'}
                updateData={() => {}}
                isUploadEnabled={false}
                uploadLink={null}
                />
        </div>
        <div className={`content ${step !== 3 ? 'is-hidden' : ''}`}>
            <p>Select for each column in your data the field that we can relate your data to. You should use each available field only once.</p>
            {columns.map((column, index) => (
                <div className="level" key={index}>
                    <div className="level-left">
                    {column.Header}
                    </div>
                    <div className="level-right">
                    <div className="select">
                    <select name={column.Header} onChange={(event) => mappedColumn(event)}>
                        <option>Select option</option>
                        {availableColumns.map((ac, i) => (
                            <option key={i}>{ac}</option>
                        ))}
                    </select>
                    </div>
                    </div>
                </div>
            ))}
        </div>
        <br></br>
        <button className={`button ${step === 1 ? 'is-hidden' : ''}`}  onClick={startAgain}>Start again</button>
        <button className={`button is-pulled-right ${step !== 3 ? 'is-hidden' : ''}`} onClick={doneMapping}>Next</button>
        </div>
            </section>
    )
}
