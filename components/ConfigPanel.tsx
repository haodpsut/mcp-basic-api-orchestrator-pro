import React, { useState, useEffect, useCallback } from 'react';
import { ApiNodeConfig } from '../types';
import { generateApiConfig } from '../services/geminiService';
import { ZapIcon, TrashIcon } from './icons';

interface ConfigPanelProps {
    node: ApiNodeConfig | null;
    onUpdate: (id: string, updates: Partial<ApiNodeConfig>) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ node, onUpdate, onDelete, onClose }) => {
    const [formData, setFormData] = useState<Partial<ApiNodeConfig>>({});
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (node) {
            setFormData(node);
        }
    }, [node]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = () => {
        if (node) {
            onUpdate(node.id, formData);
        }
    };
    
    const handleGenerateWithAI = async () => {
        if (!aiPrompt || !node) return;
        setIsGenerating(true);
        setError('');
        try {
            const config = await generateApiConfig(aiPrompt);
            const updatedConfig = { ...formData, ...config };
            setFormData(updatedConfig);
            onUpdate(node.id, updatedConfig);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleDelete = () => {
        if (node && window.confirm(`Bạn có chắc muốn xóa bước "${node.name}"?`)) {
            onDelete(node.id);
        }
    }

    if (!node) {
        return (
             <div className="bg-gray-800 border-l border-gray-700 w-full lg:w-1/3 h-full flex flex-col p-6 justify-center items-center">
                <p className="text-gray-400">Chọn một bước để cấu hình.</p>
             </div>
        )
    }

    return (
        <div className="bg-gray-800 border-l border-gray-700 w-full lg:w-1/3 h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-100">Cấu hình bước</h2>
                 <button
                    onClick={onClose}
                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                >
                    Đóng
                </button>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Tên bước (duy nhất)</label>
                    <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleInputChange} onBlur={handleBlur} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">Tạo với AI</h3>
                    <textarea name="aiPrompt" rows={2} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="VD: Lấy 5 bài viết đầu tiên từ JSONPlaceholder" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500 mb-2" />
                    <button onClick={handleGenerateWithAI} disabled={isGenerating || !aiPrompt} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors">
                        <ZapIcon/> {isGenerating ? 'Đang tạo...' : 'Tạo cấu hình'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>

                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-gray-300 mb-1">Phương thức</label>
                    <select name="method" id="method" value={formData.method || 'GET'} onChange={handleInputChange} onBlur={handleBlur} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
                        <option>GET</option>
                        <option>POST</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                    <input type="text" name="url" id="url" value={formData.url || ''} onChange={handleInputChange} onBlur={handleBlur} placeholder="https://api.example.com/data" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="headers" className="block text-sm font-medium text-gray-300 mb-1">Tiêu đề (Headers - JSON)</label>
                    <textarea name="headers" id="headers" rows={3} value={formData.headers || ''} onChange={handleInputChange} onBlur={handleBlur} placeholder='{ "Authorization": "Bearer YOUR_TOKEN" }' className="w-full font-mono text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-1">Nội dung (Body - JSON / Mẫu)</label>
                    <p className="text-xs text-gray-400 mb-1">Sử dụng <code>{"{{step_name.response.data.key}}"}</code> để dùng dữ liệu từ bước trước.</p>
                    <textarea name="body" id="body" rows={5} value={formData.body || ''} onChange={handleInputChange} onBlur={handleBlur} placeholder='{ "id": "{{get_user.response.data.id}}", "content": "Hello" }' className="w-full font-mono text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div className="pt-4 border-t border-gray-700">
                    <button onClick={handleDelete} className="w-full flex items-center justify-center px-4 py-2 bg-red-600/80 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                        <TrashIcon /> <span className="ml-2">Xóa bước này</span>
                    </button>
                </div>
            </div>
        </div>
    );
};