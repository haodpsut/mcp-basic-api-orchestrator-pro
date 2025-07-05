import React, { useState, useCallback } from 'react';
import { ApiNodeConfig, ExecutionStatus, ExecutionResult } from './types';
import { ApiNode } from './components/ApiNode';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultPanel } from './components/ResultPanel';
import { executeWorkflow } from './services/workflowExecutor';
import { PlusIcon, PlayIcon } from './components/icons';

const App: React.FC = () => {
    const [nodes, setNodes] = useState<ApiNodeConfig[]>([
      { id: 'step1', name: 'Lấy danh sách người dùng', url: 'https://jsonplaceholder.typicode.com/users', method: 'GET', headers: '{}', body: '{}', position: {x: 50, y: 50} },
      { id: 'step2', name: 'Lấy bài viết của người dùng đầu tiên', url: 'https://jsonplaceholder.typicode.com/posts?userId={{Lấy danh sách người dùng.response.data[0].id}}', method: 'GET', headers: '{}', body: '{}', position: {x: 50, y: 200} },
    ]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
    const [results, setResults] = useState<ExecutionResult[]>([]);
    const [isResultPanelOpen, setIsResultPanelOpen] = useState(false);

    const handleAddNode = () => {
        const newNodeId = `step${Date.now()}`;
        const newNode: ApiNodeConfig = {
            id: newNodeId,
            name: `Bước mới ${nodes.length + 1}`,
            url: '',
            method: 'GET',
            headers: '{}',
            body: '{}',
            position: { x: 50, y: (nodes.length * 150) + 50 }
        };
        setNodes(prev => [...prev, newNode]);
        setSelectedNodeId(newNodeId);
        setIsResultPanelOpen(false);
    };

    const handleUpdateNode = useCallback((id: string, updates: Partial<ApiNodeConfig>) => {
        setNodes(prev =>
            prev.map(node => (node.id === id ? { ...node, ...updates } : node))
        );
    }, []);
    
    const handleDeleteNode = useCallback((id: string) => {
        setNodes(prev => prev.filter(node => node.id !== id));
        setSelectedNodeId(prev => (prev === id ? null : prev));
    }, []);

    const handleSelectNode = (id: string) => {
        setSelectedNodeId(id);
        setIsResultPanelOpen(false);
    };

    const runWorkflow = async () => {
        setExecutionStatus('running');
        setIsResultPanelOpen(true);
        setSelectedNodeId(null);
        setResults([]);
        
        const res = await executeWorkflow(nodes);
        
        setResults(res);
        const hasError = res.some(r => r.status === 'error');
        setExecutionStatus(hasError ? 'error' : 'success');
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
            <header className="flex-shrink-0 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between p-3 z-10">
                <h1 className="text-xl font-bold text-gray-100">API Orchestrator</h1>
                <div className="flex items-center space-x-4">
                     <button
                        onClick={handleAddNode}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm bước API</span>
                    </button>
                    <button
                        onClick={runWorkflow}
                        disabled={executionStatus === 'running'}
                        className="flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-green-900 disabled:cursor-wait transition-colors"
                    >
                        <PlayIcon className="h-5 w-5"/> <span className="ml-2 hidden sm:inline">{executionStatus === 'running' ? 'Đang chạy...' : 'Chạy Workflow'}</span>
                    </button>
                </div>
            </header>
            <main className="flex-grow flex flex-row overflow-hidden">
                <div className="flex-grow relative h-full bg-grid-gray-700/20" style={{backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    {nodes.map((node, index) => (
                      <React.Fragment key={node.id}>
                        {index > 0 && (
                            <svg className="absolute overflow-visible" style={{ pointerEvents: 'none' }}>
                                <path
                                    d={`M ${nodes[index-1].position.x + 128} ${nodes[index-1].position.y + 70} C ${nodes[index-1].position.x + 128} ${nodes[index-1].position.y + 150}, ${node.position.x + 128} ${node.position.y - 80}, ${node.position.x + 128} ${node.position.y}`}
                                    stroke="#4A5568"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </svg>
                        )}
                        <ApiNode
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onSelect={handleSelectNode}
                        />
                      </React.Fragment>
                    ))}
                </div>
                
                {isResultPanelOpen ? (
                     <ResultPanel results={results} onClose={() => setIsResultPanelOpen(false)} />
                ) : (
                     <ConfigPanel 
                        node={selectedNode}
                        onUpdate={handleUpdateNode}
                        onDelete={handleDeleteNode}
                        onClose={() => setSelectedNodeId(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
