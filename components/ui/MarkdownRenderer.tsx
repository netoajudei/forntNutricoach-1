import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`prose prose-emerald max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom styling for tables
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-gray-50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-t border-gray-100" {...props} />
                    ),
                    // Custom styling for headings
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-800 mt-5 mb-3 border-b pb-2 border-gray-100" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
                    // Custom styling for lists
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 text-gray-600 my-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 text-gray-600 my-2" {...props} />,
                    // Custom styling for blockquotes
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-600 my-4 bg-gray-50 py-2 pr-2 rounded-r" {...props} />
                    ),
                    // Custom styling for strong/bold
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
