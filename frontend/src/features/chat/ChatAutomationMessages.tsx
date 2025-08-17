import { zodResolver } from '@hookform/resolvers/zod';
import debounce from 'lodash/debounce';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ChatAutomationFormInput from '@/features/chat/ChatAutomationFormInput';
import type { FlowQuery, MessageLogFragmentFragment } from '@/graphql/types';
import { Log } from '@/lib/log';
import { cn } from '@/lib/utils';

import { useChatScroll } from '../../hooks/use-chat-scroll';
import ChatMessage from './ChatMessage';

interface ChatAutomationMessagesProps {
    selectedFlowId: string | null;
    logs?: MessageLogFragmentFragment[];
    className?: string;
    flowData?: FlowQuery;
    onSubmitMessage: (message: string) => Promise<void>;
    onStopFlow?: (flowId: string) => Promise<void>;
}

const searchFormSchema = z.object({
    search: z.string(),
});

const ChatAutomationMessages = ({
    selectedFlowId,
    logs,
    className,
    flowData,
    onSubmitMessage,
    onStopFlow,
}: ChatAutomationMessagesProps) => {
    const [isCreatingFlow, setIsCreatingFlow] = useState(false);

    // Separate state for immediate input value and debounced search value
    const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

    const { containerRef, endRef, isScrolledToBottom, hasNewMessages, scrollToEnd } = useChatScroll(
        useMemo(() => (logs ? [...(logs || [])] : []), [logs]),
        selectedFlowId,
    );

    const form = useForm<z.infer<typeof searchFormSchema>>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            search: '',
        },
    });

    const searchValue = form.watch('search');

    const debouncedUpdateSearch = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedSearchValue(value);
            }, 500),
        [],
    );

    useEffect(() => {
        debouncedUpdateSearch(searchValue);
        return () => {
            debouncedUpdateSearch.cancel();
        };
    }, [searchValue, debouncedUpdateSearch]);

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            debouncedUpdateSearch.cancel();
        };
    }, [debouncedUpdateSearch]);

    // Clear search when flow changes to prevent stale search state
    useEffect(() => {
        form.reset({ search: '' });
        setDebouncedSearchValue('');
        debouncedUpdateSearch.cancel();
    }, [selectedFlowId, form, debouncedUpdateSearch]);

    // Memoize filtered logs to avoid recomputing on every render
    // Use debouncedSearchValue for filtering to improve performance
    const filteredLogs = useMemo(() => {
        const search = debouncedSearchValue.toLowerCase().trim();

        if (!search || !logs) {
            return logs || [];
        }

        return logs.filter(
            (log) =>
                log.message.toLowerCase().includes(search) ||
                (log.result && log.result.toLowerCase().includes(search)) ||
                (log.thinking && log.thinking.toLowerCase().includes(search)),
        );
    }, [logs, debouncedSearchValue]);

    // Message submission handler with flow creation state management
    const handleSubmitMessage = async (message: string) => {
        if (!message.trim()) {
            return;
        }

        try {
            // Show loading indicator if a new flow is being created
            if (selectedFlowId === 'new') {
                setIsCreatingFlow(true);
            }
            await onSubmitMessage(message);
        } catch (error) {
            Log.error('Error submitting message:', error);
            throw error;
        } finally {
            setIsCreatingFlow(false);
        }
    };

    return (
        <div className={cn('flex h-full flex-col', className)}>
            <div className="sticky top-0 z-10 bg-background pb-4">
                <Form {...form}>
                    <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                            <FormControl>
                                <div className="relative p-px">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Search messages..."
                                        className="px-9"
                                        autoComplete="off"
                                        disabled={isCreatingFlow}
                                    />
                                    {field.value && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-1/2 -translate-y-1/2"
                                            onClick={() => {
                                                form.reset({ search: '' });
                                                setDebouncedSearchValue('');
                                                debouncedUpdateSearch.cancel();
                                            }}
                                            disabled={isCreatingFlow}
                                        >
                                            <X />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                        )}
                    />
                </Form>
            </div>

            {isCreatingFlow ? (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="size-12 animate-spin" />
                        <p>Creating flow...</p>
                        <p className="text-xs">This may take some time as Docker images are downloaded</p>
                    </div>
                </div>
            ) : filteredLogs.length > 0 || selectedFlowId !== 'new' ? (
                <div className="relative pb-4 h-full overflow-y-hidden">
                    <div
                        ref={containerRef}
                        className="h-full space-y-4 overflow-y-auto"
                    >
                        {filteredLogs.map((log) => (
                            <ChatMessage
                                key={log.id}
                                log={log}
                                searchValue={debouncedSearchValue}
                            />
                        ))}
                        <div ref={endRef} />
                    </div>

                    {hasNewMessages && !isScrolledToBottom && (
                        <Button
                            type="button"
                            size="icon"
                            className="absolute bottom-4 right-4 z-10 h-9 w-9 rounded-full shadow-md hover:shadow-lg"
                            onClick={() => scrollToEnd()}
                        >
                            <ChevronDown />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <p>No Active Tasks</p>
                        <p className="text-xs">
                            Starting a new task may take some time as the PentAGI agent downloads the required Docker
                            image
                        </p>
                    </div>
                </div>
            )}

            <div className="sticky bottom-0 border-t bg-background p-px pt-4">
                <ChatAutomationFormInput
                    selectedFlowId={selectedFlowId}
                    flowStatus={flowData?.flow?.status}
                    onSubmitMessage={handleSubmitMessage}
                    onStopFlow={onStopFlow}
                    isCreatingFlow={isCreatingFlow}
                />
            </div>
        </div>
    );
};

export default memo(ChatAutomationMessages);
