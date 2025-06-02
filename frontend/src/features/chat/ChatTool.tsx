import { Copy, Hammer } from 'lucide-react';
import { useCallback, useState, useEffect, useMemo, memo } from 'react';

import Markdown from '@/components/Markdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { SearchLogFragmentFragment } from '@/graphql/types';
import { formatDate, formatName } from '@/lib/utils/format';
import { copyMessageToClipboard } from '@/lib/сlipboard';

import ChatAgentIcon from './ChatAgentIcon';

interface ChatToolProps {
    log: SearchLogFragmentFragment;
    searchValue?: string;
}

// Helper function to check if text contains search value (case-insensitive)
const containsSearchValue = (text: string | null | undefined, searchValue: string): boolean => {
    if (!text || !searchValue.trim()) {
        return false;
    }
    return text.toLowerCase().includes(searchValue.toLowerCase().trim());
};

const ChatTool = ({ log, searchValue = '' }: ChatToolProps) => {
    const { executor, initiator, query, result, engine, taskId, subtaskId, createdAt } = log;
    
    // Memoize search checks to avoid recalculating on every render
    const searchChecks = useMemo(() => {
        const trimmedSearch = searchValue.trim();
        if (!trimmedSearch) {
            return { hasQueryMatch: false, hasResultMatch: false };
        }
        
        return {
            hasQueryMatch: containsSearchValue(query, trimmedSearch),
            hasResultMatch: containsSearchValue(result, trimmedSearch),
        };
    }, [searchValue, query, result]);

    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    // Auto-expand details if they contain search matches
    useEffect(() => {
        const trimmedSearch = searchValue.trim();
        
        if (trimmedSearch) {
            // Expand result block only if it contains the search term
            if (searchChecks.hasResultMatch) {
                setIsDetailsVisible(true);
            }
        } else {
            // Reset to default state when search is cleared
            setIsDetailsVisible(false);
        }
    }, [searchValue, searchChecks.hasResultMatch]);

    const handleCopy = useCallback(async () => {
        await copyMessageToClipboard({
            message: query,
            result: result || undefined,
        });
    }, [query, result]);

    return (
        <div className="flex flex-col items-start">
            <div className="max-w-full rounded-lg bg-accent p-3 text-accent-foreground">
                <div className="flex flex-col">
                    <div className="cursor-pointer text-sm font-semibold">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1">
                                    <Hammer className="size-4 text-muted-foreground" />
                                    <span>{formatName(engine)}</span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>Tool name</TooltipContent>
                        </Tooltip>
                    </div>

                    <Markdown className="prose-xs prose-fixed break-words" searchValue={searchValue}>{query}</Markdown>
                </div>
                {result && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        <div
                            onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                            className="cursor-pointer"
                        >
                            {isDetailsVisible ? 'Hide details' : 'Show details'}
                        </div>
                        {isDetailsVisible && (
                            <>
                                <div className="my-2 border-t dark:border-gray-700" />
                                <Markdown className="prose-xs prose-fixed break-words" searchValue={searchValue}>{result}</Markdown>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-1 flex items-center gap-1 px-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                    <ChatAgentIcon
                        type={initiator}
                        className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground/50">→</span>
                    <ChatAgentIcon
                        type={executor}
                        className="text-muted-foreground"
                    />
                </span>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Copy 
                            className="size-3 shrink-0 cursor-pointer hover:text-foreground ml-1 mr-1 transition-colors" 
                            onClick={handleCopy}
                        />
                    </TooltipTrigger>
                    <TooltipContent>Copy</TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground/50">{formatDate(new Date(createdAt))}</span>
                {taskId && (
                    <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-muted-foreground/50">Task ID: {taskId}</span>
                    </>
                )}
                {subtaskId && (
                    <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-muted-foreground/50">Subtask ID: {subtaskId}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(ChatTool);
