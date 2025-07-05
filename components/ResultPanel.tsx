import React, { useState } from 'react';
import { ExecutionResult } from '../types';
import { ChevronDownIcon, DownloadIcon } from './icons';

interface ResultPanelProps {
    results: ExecutionResult[];
    onClose: () => void;
}

const ResultItem: React.FC<{ result: ExecutionResult }> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isSuccess = result.status === 'success';

    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-700/50"
            >
                <div className="flex items-center">
                    <span className={`mr-3 h-2.5 w-2.5 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium text-gray-200">{result.stepName}</span>
                    <span className="ml-4 text-sm text-gray-400">({result.duration}ms)</span>
                </div>
                <div className="flex items-center">
                     <span className={`text-sm font-semibold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                        {isSuccess ? 'Thành công' : 'Lỗi'}
                    </span>
                    <ChevronDownIcon className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <pre className="text-sm bg-gray-900 p-3 rounded-md overflow-x-auto text-cyan-300 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        <code>
                            {JSON.stringify(isSuccess ? result.data : { error: result.error }, null, 2)}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );
};

export const ResultPanel: React.FC<ResultPanelProps> = ({ results, onClose }) => {
    const handleExportCSV = () => {
        const lastSuccessResult = [...results].reverse().find(r => r.status === 'success');

        if (!lastSuccessResult || !lastSuccessResult.data) {
            alert("Không có dữ liệu thành công để xuất.");
            return;
        }

        let dataToExport = Array.isArray(lastSuccessResult.data) ? lastSuccessResult.data : [lastSuccessResult.data];

        if (dataToExport.length === 0 || typeof dataToExport[0] !== 'object' || dataToExport[0] === null) {
            alert("Dữ liệu từ bước cuối không phải là định dạng phù hợp để xuất (cần là một đối tượng hoặc một mảng các đối tượng).");
            return;
        }

        // Create CSV content
        const headers = Object.keys(dataToExport[0]);
        const replacer = (key: any, value: any) => value === null ? '' : value;
        
        const csv = [
            headers.join(','), // header row
            ...dataToExport.map((row: any) => headers.map(fieldName => {
                let cellData = row[fieldName];
                if (cellData && typeof cellData === 'object') {
                    cellData = JSON.stringify(cellData);
                }
                const strData = String(replacer(fieldName, cellData));
                // Escape quotes and wrap in quotes
                return `"${strData.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\r\n');

        // Create and download blob
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${lastSuccessResult.stepName.replace(/\s+/g, '_')}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="bg-gray-800 border-l border-gray-700 w-full lg:w-1/3 h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-100">Kết quả thực thi</h2>
                 <div className="flex items-center space-x-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={!results.some(r => r.status === 'success')}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title="Xuất kết quả của bước thành công cuối cùng ra CSV"
                    >
                        <DownloadIcon className="h-4 w-4 mr-1.5" />
                        Xuất CSV
                    </button>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {results.length === 0 ? (
                    <p className="p-4 text-gray-400">Chưa có kết quả.</p>
                ) : (
                    results.map(result => <ResultItem key={result.stepId} result={result} />)
                )}
            </div>
        </div>
    );
};