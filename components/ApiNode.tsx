import React from 'react';
import { ApiNodeConfig } from '../types';

interface ApiNodeProps {
    node: ApiNodeConfig;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const ApiNode: React.FC<ApiNodeProps> = ({ node, isSelected, onSelect }) => {
    const methodColor = node.method === 'GET' ? 'bg-green-600' : 'bg-orange-600';

    return (
        <div
            onClick={() => onSelect(node.id)}
            style={{ top: `${node.position.y}px`, left: `${node.position.x}px` }}
            className={`absolute cursor-pointer w-64 p-4 rounded-lg shadow-lg border-2 transition-all duration-200 ${isSelected ? 'border-blue-500 bg-gray-700 scale-105' : 'border-gray-600 bg-gray-800 hover:bg-gray-700/50'}`}
        >
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-100 truncate pr-2">{node.name}</h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold text-white rounded-full ${methodColor}`}>
                    {node.method}
                </span>
            </div>
            <p className="text-sm text-gray-400 mt-2 break-all">{node.url || 'Chưa có URL'}</p>
        </div>
    );
};
