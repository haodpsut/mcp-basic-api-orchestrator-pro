import { ApiNodeConfig, ExecutionResult } from '../types';

const resolveTemplate = (template: string, results: Map<string, ExecutionResult>): string => {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\.(response\..+?)\s*\}\}/g, (match, stepName, path) => {
        const stepResult = Array.from(results.values()).find(r => r.stepName === stepName);
        if (!stepResult || stepResult.status !== 'success') {
            return match; // Or throw an error, or return empty string
        }

        try {
            // path is 'response.data.key' or similar
            const parts = path.split('.').slice(1); // remove 'response'
            let value = stepResult.data;
            for (const part of parts) {
                if (value === null || typeof value === 'undefined') return match;
                // Handle array indexing like 'users[0]'
                const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
                if(arrayMatch) {
                    const arrayKey = arrayMatch[1];
                    const index = parseInt(arrayMatch[2], 10);
                    value = value[arrayKey]?.[index];
                } else {
                   value = value[part];
                }
            }
            return typeof value === 'object' ? JSON.stringify(value) : String(value);
        } catch (e) {
            console.error(`Error resolving template ${match}:`, e);
            return match;
        }
    });
};

export const executeWorkflow = async (nodes: ApiNodeConfig[]): Promise<ExecutionResult[]> => {
    const resultsHistory: ExecutionResult[] = [];
    const resultsMap = new Map<string, ExecutionResult>();

    for (const node of nodes) {
        const startTime = Date.now();
        try {
            const resolvedUrl = resolveTemplate(node.url, resultsMap);
            const resolvedBody = resolveTemplate(node.body, resultsMap);
            const resolvedHeaders = resolveTemplate(node.headers, resultsMap);

            const headers = JSON.parse(resolvedHeaders || '{}');
            const requestOptions: RequestInit = {
                method: node.method,
                headers: new Headers(headers),
            };

            if (node.method === 'POST') {
                requestOptions.body = resolvedBody;
            }

            const response = await fetch(resolvedUrl, requestOptions);
            const duration = Date.now() - startTime;
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            const result: ExecutionResult = {
                stepId: node.id,
                stepName: node.name,
                status: 'success',
                data: responseData,
                duration
            };
            resultsHistory.push(result);
            resultsMap.set(node.name, result);
        } catch (error: any) {
            const duration = Date.now() - startTime;
            const errorResult: ExecutionResult = {
                stepId: node.id,
                stepName: node.name,
                status: 'error',
                error: error.message || 'An unknown error occurred.',
                data: null,
                duration
            };
            resultsHistory.push(errorResult);
            resultsMap.set(node.name, errorResult);
            // Stop execution on first error
            break;
        }
    }
    return resultsHistory;
};
