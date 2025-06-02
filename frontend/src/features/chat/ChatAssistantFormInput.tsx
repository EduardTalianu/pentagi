import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, Square, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusType } from '@/graphql/types';
import { Log } from '@/lib/log';

const formSchema = z.object({
    message: z.string().min(1, { message: 'Message cannot be empty' }),
    useAgents: z.boolean().default(false),
});

interface ChatAssistantFormInputProps {
    selectedFlowId: string | null;
    assistantStatus?: StatusType;
    isUseAgentsDefault?: boolean;
    isProviderAvailable?: boolean;
    isCreatingAssistant?: boolean;
    onSubmitMessage: (message: string, useAgents: boolean) => Promise<void>;
    onStopFlow?: (flowId: string) => Promise<void>;
}

const ChatAssistantFormInput = ({
    selectedFlowId,
    assistantStatus,
    isUseAgentsDefault = false,
    isProviderAvailable = true,
    isCreatingAssistant = false,
    onSubmitMessage,
    onStopFlow,
}: ChatAssistantFormInputProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [useAgents, setUseAgents] = useState(isUseAgentsDefault || false);
    const textareaId = 'chat-textarea';

    // Input is disabled in these scenarios:
    // 1. No flow selected
    // 2. Currently submitting or creating an assistant
    // 3. Assistant is running (not waiting)
    // 4. Provider is unavailable
    // 5. Assistant is in a terminal state (finished/failed)
    const isRunning = assistantStatus === StatusType.Running;
    const isCreated = assistantStatus === StatusType.Created;
    const isAssistantTerminal = assistantStatus === StatusType.Finished || assistantStatus === StatusType.Failed;

    const isInputDisabled =
        !selectedFlowId ||
        isSubmitting ||
        isCreatingAssistant ||
        isRunning ||
        isCreated ||
        !isProviderAvailable ||
        isAssistantTerminal;

    const isButtonDisabled =
        !selectedFlowId ||
        isSubmitting ||
        isCreatingAssistant ||
        isStopping ||
        isCreated ||
        !isProviderAvailable ||
        isAssistantTerminal;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: '',
            useAgents,
        },
    });

    // Reset form when flow ID changes
    useEffect(() => {
        form.reset({
            message: '',
            useAgents: isUseAgentsDefault,
        });
    }, [selectedFlowId, form, isUseAgentsDefault]);

    // Update local useAgents state when isUseAgentsDefault changes
    useEffect(() => {
        setUseAgents(isUseAgentsDefault || false);
    }, [isUseAgentsDefault]);

    // Update the form value when useAgents state changes
    useEffect(() => {
        form.setValue('useAgents', useAgents);
    }, [useAgents, form]);

    const getPlaceholderText = () => {
        if (!selectedFlowId) {
            return 'Select a flow...';
        }

        if (selectedFlowId === 'new') {
            return 'What would you like me to help you with?';
        }

        // Show creating assistant message while in creation mode
        if (isCreatingAssistant) {
            return 'Creating assistant...';
        }

        // Provider unavailable has highest priority message
        if (!isProviderAvailable) {
            return 'The selected provider is unavailable...';
        }

        // No assistant selected - prompt to create one
        if (!assistantStatus) {
            return 'Type a message to create a new assistant...';
        }

        // Assistant-specific statuses
        switch (assistantStatus) {
            case StatusType.Waiting: {
                return 'Continue the conversation...';
            }
            case StatusType.Running: {
                return 'Assistant is running... Click Stop to interrupt';
            }
            case StatusType.Created: {
                return 'Assistant is starting...';
            }
            case StatusType.Finished:
            case StatusType.Failed: {
                return 'This assistant session has ended. Create a new one to continue.';
            }
            default: {
                return 'Type your message...';
            }
        }
    };

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        // Make sure we have a non-empty message
        const message = values.message.trim();
        if (!message) {
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmitMessage(message, values.useAgents);
            // Only reset the form on successful submission
            form.reset();
        } catch (error) {
            Log.error('Error submitting message:', error);
            // Don't reset the form on error so user doesn't lose their message
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStopFlow = async () => {
        if (!selectedFlowId || !onStopFlow) return;

        try {
            setIsStopping(true);
            await onStopFlow(selectedFlowId);
        } catch (error) {
            Log.error('Error stopping flow:', error);
            // TODO: Add error notification UI
        } finally {
            setIsStopping(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Don't process keyboard shortcuts when assistant is running
        if (assistantStatus === StatusType.Running || isCreatingAssistant) {
            return;
        }

        const isEnterPress = event.key === 'Enter';
        const isCtrlEnter = isEnterPress && (event.ctrlKey || event.metaKey);
        const isEnterOnly = isEnterPress && !event.shiftKey;

        if (!isEnterOnly && !isCtrlEnter) {
            return;
        }

        event.preventDefault();

        if (isInputDisabled) {
            return;
        }

        form.handleSubmit(handleSubmit)();
    };

    // Auto-focus on textarea when needed
    useEffect(() => {
        if (
            !isInputDisabled &&
            (selectedFlowId === 'new' ||
                assistantStatus === StatusType.Waiting ||
                !assistantStatus)
        ) {
            const textarea = document.querySelector(`#${textareaId}`) as HTMLTextAreaElement;
            if (textarea) {
                const timeoutId = setTimeout(() => textarea.focus(), 100);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [selectedFlowId, assistantStatus, isInputDisabled]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full items-center space-x-2"
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant={useAgents ? 'default' : 'outline'}
                                size="icon"
                                className="mb-px mt-auto"
                                disabled={isInputDisabled}
                                onClick={() => setUseAgents(!useAgents)}
                            >
                                <Users className="size-4" />
                                <span className="sr-only">{useAgents ? 'Disable agents' : 'Enable agents'}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {useAgents ? 'Disable agents' : 'Enable agents'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormControl>
                            <Textarea
                                {...field}
                                id={textareaId}
                                placeholder={getPlaceholderText()}
                                disabled={isInputDisabled}
                                onKeyDown={handleKeyDown}
                                className="resize-none"
                            />
                        </FormControl>
                    )}
                />
                {isRunning ? (
                    <Button
                        className="mb-px mt-auto"
                        type="button"
                        variant="destructive"
                        disabled={isButtonDisabled || isStopping}
                        onClick={handleStopFlow}
                    >
                        {isStopping ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                        <span className="sr-only">Stop</span>
                    </Button>
                ) : (
                    <Button
                        className="mb-px mt-auto"
                        type="submit"
                        disabled={isButtonDisabled}
                    >
                        {isSubmitting || isCreatingAssistant ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        <span className="sr-only">Send</span>
                    </Button>
                )}
            </form>
        </Form>
    );
};

export default ChatAssistantFormInput;
