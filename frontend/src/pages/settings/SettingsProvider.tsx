import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusCard } from '@/components/ui/status-card';
import {
    ProviderType,
    ReasoningEffort,
    useCreateProviderMutation,
    useDeleteProviderMutation,
    useSettingsProvidersQuery,
    useTestProviderMutation,
    useUpdateProviderMutation,
    type AgentConfigInput,
    type AgentsConfigInput,
    type ProviderConfigFragmentFragment,
} from '@/graphql/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    AlertCircle,
    Check,
    CheckCircle,
    ChevronsUpDown,
    Clock,
    Lightbulb,
    Loader2,
    Play,
    Save,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

type Provider = ProviderConfigFragmentFragment;

// Universal field components using useController
interface ControllerProps {
    name: string;
    control: any;
    disabled?: boolean;
}

interface BaseInputProps {
    placeholder?: string;
}

interface NumberInputProps extends BaseInputProps {
    step?: string;
    min?: string;
    max?: string;
}

interface BaseFieldProps extends ControllerProps {
    label: string;
}

interface FormInputStringItemProps extends BaseFieldProps, BaseInputProps {
    description?: string;
}

interface FormInputNumberItemProps extends BaseFieldProps, NumberInputProps {
    valueType?: 'float' | 'integer';
    description?: string;
}

const FormInputStringItem: React.FC<FormInputStringItemProps> = ({
    name,
    control,
    disabled,
    label,
    placeholder,
    description,
}) => {
    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: undefined,
        disabled,
    });

    const inputProps = { placeholder };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <Input
                    {...field}
                    {...inputProps}
                    value={field.value ?? ''}
                />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
        </FormItem>
    );
};

const FormInputNumberItem: React.FC<FormInputNumberItemProps> = ({
    name,
    control,
    disabled,
    label,
    placeholder,
    step,
    min,
    max,
    valueType = 'float',
    description,
}) => {
    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: undefined,
        disabled,
    });

    const parseValue = (value: string) => {
        if (value === '') {
            return undefined;
        }

        return valueType === 'float' ? parseFloat(value) : parseInt(value);
    };

    const inputProps = {
        type: 'number' as const,
        step,
        min,
        max,
        placeholder,
    };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <Input
                    {...field}
                    {...inputProps}
                    value={field.value ?? ''}
                    onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(parseValue(value));
                    }}
                />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
        </FormItem>
    );
};

interface FormComboboxItemProps extends BaseFieldProps, BaseInputProps {
    options: string[];
    allowCustom?: boolean;
    contentClass?: string;
    description?: string;
}

const FormComboboxItem: React.FC<FormComboboxItemProps> = ({
    name,
    control,
    disabled,
    label,
    placeholder,
    options,
    allowCustom = true,
    contentClass,
    description,
}) => {
    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: undefined,
        disabled,
    });

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Filter options based on search
    const filteredOptions = options.filter((option) => option?.toLowerCase().includes(search?.toLowerCase()));

    const displayValue = field.value ?? '';

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <Popover
                    open={open}
                    onOpenChange={setOpen}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn('w-full justify-between', !displayValue && 'text-muted-foreground')}
                            disabled={disabled}
                        >
                            {displayValue || placeholder}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className={cn(contentClass, 'p-0')}
                        align="start"
                        style={{
                            width: 'var(--radix-popover-trigger-width)',
                            maxHeight: 'var(--radix-popover-content-available-height)',
                        }}
                    >
                        <Command>
                            <CommandInput
                                placeholder={`Search ${label.toLowerCase()}...`}
                                className="h-9"
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="text-center py-2">
                                        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} found.</p>
                                        {search && allowCustom && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => {
                                                    field.onChange(search);
                                                    setOpen(false);
                                                    setSearch('');
                                                }}
                                            >
                                                Use "{search}" as custom {label.toLowerCase()}
                                            </Button>
                                        )}
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredOptions.map((option) => (
                                        <CommandItem
                                            key={option}
                                            value={option}
                                            onSelect={() => {
                                                field.onChange(option);
                                                setOpen(false);
                                                setSearch('');
                                            }}
                                        >
                                            {option}
                                            <Check
                                                className={cn(
                                                    'ml-auto',
                                                    displayValue === option ? 'opacity-100' : 'opacity-0',
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
        </FormItem>
    );
};

interface ModelOption {
    name: string;
    thinking?: boolean;
    price?: { input: number; output: number } | null;
}

interface FormModelComboboxItemProps extends BaseFieldProps, BaseInputProps {
    options: ModelOption[];
    allowCustom?: boolean;
    contentClass?: string;
    description?: string;
}

const FormModelComboboxItem: React.FC<FormModelComboboxItemProps> = ({
    name,
    control,
    disabled,
    label,
    placeholder,
    options,
    allowCustom = true,
    contentClass,
    description,
}) => {
    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: undefined,
        disabled,
    });

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Filter options based on search
    const filteredOptions = options.filter((option) => option.name?.toLowerCase().includes(search?.toLowerCase()));

    const displayValue = field.value ?? '';

    // Format price for display
    const formatPrice = (price?: { input: number; output: number } | null): string => {
        if (!price || ((!price.input || price.input === 0) && (!price.output || price.output === 0))) {
            return 'free';
        }

        const formatValue = (value: number): string => {
            return value.toFixed(6).replace(/\.?0+$/, '');
        };

        return `$${formatValue(price.input)}/$${formatValue(price.output)}`;
    };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <Popover
                    open={open}
                    onOpenChange={setOpen}
                >
                    <div className="flex w-full">
                        {/* Input field - main control */}
                        <Input
                            value={displayValue}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="rounded-r-none border-r-0 focus-visible:z-10"
                        />
                        {/* Dropdown trigger button */}
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-l-none border-l-0 px-3 hover:z-10"
                                disabled={disabled}
                                type="button"
                            >
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className={cn(contentClass, 'p-0 w-80 sm:w-[480px] md:w-[640px]')}
                            align="end"
                        >
                            <Command>
                                <CommandInput
                                    placeholder={`Search ${label.toLowerCase()}...`}
                                    className="h-9"
                                    value={search}
                                    onValueChange={setSearch}
                                />
                                <CommandList>
                                    <CommandEmpty>
                                        <div className="text-center py-2">
                                            <p className="text-sm text-muted-foreground">
                                                No {label.toLowerCase()} found.
                                            </p>
                                            {search && allowCustom && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => {
                                                        field.onChange(search);
                                                        setOpen(false);
                                                        setSearch('');
                                                    }}
                                                >
                                                    Use "{search}" as custom {label.toLowerCase()}
                                                </Button>
                                            )}
                                        </div>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {filteredOptions.map((option) => (
                                            <CommandItem
                                                key={option.name}
                                                value={option.name}
                                                onSelect={() => {
                                                    field.onChange(option.name);
                                                    setOpen(false);
                                                    setSearch('');
                                                }}
                                            >
                                                <div className="flex items-center justify-between w-full min-w-0 gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="truncate">{option.name}</span>
                                                        {option.thinking && (
                                                            <Lightbulb className="h-3 w-3 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                        {formatPrice(option.price)}
                                                    </span>
                                                </div>
                                                <Check
                                                    className={cn(
                                                        'ml-auto',
                                                        displayValue === option.name ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </div>
                </Popover>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
        </FormItem>
    );
};

// Define agent configuration schema
const agentConfigSchema = z
    .object({
        model: z.preprocess((value) => value || '', z.string().min(1, 'Model is required')),
        temperature: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        maxTokens: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        topK: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        topP: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        minLength: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        maxLength: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        repetitionPenalty: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        frequencyPenalty: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        presencePenalty: z.preprocess(
            (value) => (value === '' || value === undefined ? null : value),
            z.number().nullable().optional(),
        ),
        reasoning: z
            .object({
                effort: z.preprocess(
                    (value) => (value === '' || value === undefined ? null : value),
                    z.string().nullable().optional(),
                ),
                maxTokens: z.preprocess(
                    (value) => (value === '' || value === undefined ? null : value),
                    z.number().nullable().optional(),
                ),
            })
            .nullable()
            .optional(),
        price: z
            .object({
                input: z.preprocess(
                    (value) => (value === '' || value === undefined ? null : value),
                    z.number().nullable().optional(),
                ),
                output: z.preprocess(
                    (value) => (value === '' || value === undefined ? null : value),
                    z.number().nullable().optional(),
                ),
            })
            .nullable()
            .optional(),
    })
    .optional();

// Define form schema
const formSchema = z.object({
    type: z.preprocess((value) => value || '', z.string().min(1, 'Provider type is required')),
    name: z.preprocess(
        (value) => value || '',
        z.string().min(1, 'Provider name is required').max(50, 'Maximum 50 characters allowed'),
    ),
    agents: z.record(z.string(), agentConfigSchema).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Type for agents field in form
type FormAgents = FormData['agents'];

// Convert camelCase key to display name (e.g., 'simpleJson' -> 'Simple Json')
const getName = (key: string): string => key.replace(/([A-Z])/g, ' $1').replace(/^./, (item) => item.toUpperCase());

// Helper function to convert string to ReasoningEffort enum
const getReasoningEffort = (effort: string | null | undefined): ReasoningEffort | null => {
    if (!effort) return null;

    switch (effort.toLowerCase()) {
        case 'low':
            return ReasoningEffort.Low;
        case 'medium':
            return ReasoningEffort.Medium;
        case 'high':
            return ReasoningEffort.High;
        default:
            return null;
    }
};

// Helper function to convert form data to GraphQL input
const transformFormToGraphQL = (
    formData: FormData,
): {
    name: string;
    type: ProviderType;
    agents: AgentsConfigInput;
} => {
    const agents = Object.entries(formData.agents || {})
        .filter(([key, data]) => key !== '__typename' && data?.model)
        .reduce((configs, [key, data]) => {
            const config: AgentConfigInput = {
                model: data!.model, // After filter, data and model are guaranteed to exist
                temperature: data?.temperature ?? null,
                maxTokens: data?.maxTokens ?? null,
                topK: data?.topK ?? null,
                topP: data?.topP ?? null,
                minLength: data?.minLength ?? null,
                maxLength: data?.maxLength ?? null,
                repetitionPenalty: data?.repetitionPenalty ?? null,
                frequencyPenalty: data?.frequencyPenalty ?? null,
                presencePenalty: data?.presencePenalty ?? null,
                reasoning: data?.reasoning
                    ? {
                          effort: getReasoningEffort(data?.reasoning.effort),
                          maxTokens: data?.reasoning.maxTokens ?? null,
                      }
                    : null,
                price:
                    data?.price &&
                    data?.price.input !== null &&
                    data?.price.output !== null &&
                    typeof data?.price.input === 'number' &&
                    typeof data?.price.output === 'number'
                        ? {
                              input: data?.price.input,
                              output: data?.price.output,
                          }
                        : null,
            };

            return { ...configs, [key]: config };
        }, {} as AgentsConfigInput);

    return {
        name: formData.name,
        type: formData.type as ProviderType,
        agents,
    };
};

// Helper function to recursively remove __typename from objects
const normalizeGraphQLData = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(normalizeGraphQLData);
    }

    if (typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([key]) => key !== '__typename')
                .map(([key, value]) => [key, normalizeGraphQLData(value)]),
        );
    }

    return obj;
};

// Component to render test results dialog
const TestResultsDialog = ({
    open,
    onOpenChange,
    results,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    results: any;
}) => {
    if (!results) return null;

    // Transform results object to array, removing __typename
    const agentResults = Object.entries(results)
        .filter(([key]) => key !== '__typename')
        .map(([agentType, agentData]: [string, any]) => ({
            agentType,
            tests: agentData?.tests || [],
        }));

    const getStatusIcon = (result: boolean) => {
        if (result === true) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        } else if (result === false) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        } else {
            return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (result: boolean) => {
        if (result === true) {
            return 'text-green-600';
        } else if (result === false) {
            return 'text-red-600';
        } else {
            return 'text-yellow-600';
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Provider Test Results</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-6">
                    <Accordion
                        type="multiple"
                        className="w-full"
                    >
                        {agentResults.map(({ agentType, tests }) => {
                            const testsCount = tests.length;
                            const successTestsCount = tests.filter((test: any) => test.result === true).length;

                            return (
                                <AccordionItem
                                    key={agentType}
                                    value={agentType}
                                >
                                    <AccordionTrigger className="text-left">
                                        <div className="flex items-center justify-between w-full mr-4">
                                            <span className="text-lg font-semibold capitalize">{agentType}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {successTestsCount}/{testsCount} tests passed
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pt-2">
                                            {tests.map((test: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-3"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(test.result)}
                                                            <span className="font-medium">{test.name}</span>
                                                            {test.type && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    ({test.type})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            {test.reasoning !== undefined && (
                                                                <span>Reasoning: {test.reasoning ? 'Yes' : 'No'}</span>
                                                            )}
                                                            {test.streaming !== undefined && (
                                                                <span>Streaming: {test.streaming ? 'Yes' : 'No'}</span>
                                                            )}
                                                            {test.latency && <span>Latency: {test.latency}ms</span>}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`text-sm font-medium ${getStatusColor(test.result)}`}
                                                    >
                                                        Result:{' '}
                                                        {test.result === true
                                                            ? 'Success'
                                                            : test.result === false
                                                              ? 'Failed'
                                                              : 'Unknown'}
                                                    </div>
                                                    {test.error && (
                                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                                            <strong>Error:</strong> {test.error}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {tests.length === 0 && (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    No tests available for this agent
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SettingsProvider = () => {
    const { providerId } = useParams<{ providerId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data, loading, error } = useSettingsProvidersQuery();
    const [createProvider, { loading: isCreateLoading, error: createError }] = useCreateProviderMutation();
    const [updateProvider, { loading: isUpdateLoading, error: updateError }] = useUpdateProviderMutation();
    const [deleteProvider, { loading: isDeleteLoading, error: deleteError }] = useDeleteProviderMutation();
    const [testProvider, { loading: isTestLoading, error: testError }] = useTestProviderMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);

    const isNew = providerId === 'new';
    const isLoading = isCreateLoading || isUpdateLoading || isDeleteLoading;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: undefined,
            type: undefined,
            agents: {},
        },
    });

    // Watch selected type
    const selectedType = form.watch('type');

    // Read query parameters for form initialization (stable)
    const formQueryParams = useMemo(
        () => ({
            type: searchParams.get('type'),
            id: searchParams.get('id'),
        }),
        [searchParams],
    );

    // Get dynamic agent types from data
    const agentTypes = useMemo(() => {
        let agentsSource = null;

        if (isNew && selectedType && data?.settingsProviders?.default) {
            // For new providers, use default provider for selected type
            agentsSource =
                data.settingsProviders.default?.[selectedType as keyof typeof data.settingsProviders.default]?.agents;
        } else if (!isNew && providerId && data?.settingsProviders?.userDefined) {
            // For existing providers, use current provider's agents
            const provider = data.settingsProviders.userDefined.find((p: Provider) => p.id === +providerId);
            agentsSource = provider?.agents;
        }

        // If no specific source, try to get from any available default provider
        if (!agentsSource && data?.settingsProviders?.default) {
            const defaultProviders = data.settingsProviders.default;
            // Try to find first available default provider with agents
            const firstDefaultProvider = Object.values(defaultProviders).find((provider) => provider?.agents);
            agentsSource = firstDefaultProvider?.agents;
        }

        // Extract agent types from the source
        if (agentsSource) {
            return Object.entries(agentsSource)
                .filter(([key, data]) => key !== '__typename' && data)
                .map(([key]) => key)
                .sort();
        }

        // Fallback to hardcoded list if no data available
        return [
            'adviser',
            'agent',
            'assistant',
            'coder',
            'enricher',
            'generator',
            'installer',
            'pentester',
            'reflector',
            'refiner',
            'searcher',
            'simple',
            'simpleJson',
        ];
    }, [isNew, selectedType, providerId, data]);

    // Get available models filtered by selected provider type
    const availableModels = useMemo(() => {
        if (!data?.settingsProviders?.models || !selectedType) {
            return [];
        }

        // Filter models by selected provider type
        const models = data.settingsProviders.models;
        const providerModels = models[selectedType as keyof typeof models];
        if (!providerModels?.length) {
            return [];
        }

        return providerModels
            .map((model: any) => ({
                name: model.name,
                thinking: model.thinking,
                price: model.price,
            }))
            .filter((model) => model.name) // Remove any models without names
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [data, selectedType]);

    // Fill agents when provider type is selected (only for new providers)
    useEffect(() => {
        if (!isNew || !selectedType || !data?.settingsProviders?.default || !availableModels.length) {
            return;
        }

        const defaultProvider =
            data.settingsProviders.default[selectedType as keyof typeof data.settingsProviders.default];

        if (defaultProvider?.agents) {
            const agents = Object.fromEntries(
                Object.entries(defaultProvider.agents)
                    .filter(([key]) => key !== '__typename')
                    .map(([key, data]) => {
                        // const agent = Object.fromEntries(
                        //     Object.entries(data).filter(([key]) => key !== '__typename'),
                        // ) as AgentConfigInput;
                        const agent = { ...data };

                        // Check if the model from defaultProvider exists in availableModels
                        if (agent.model && !availableModels.find((m) => m.name === agent.model)) {
                            // Use first available model if default model not found
                            agent.model = availableModels[0]?.name || agent.model;
                        }

                        return [key, agent];
                    }),
            );

            form.setValue('agents', normalizeGraphQLData(agents) as FormAgents);
        }
    }, [selectedType, isNew, data, form, availableModels]);

    // Update query parameter when type changes (only for new providers)
    useEffect(() => {
        if (!isNew) {
            // Clear query parameters for existing providers
            if (searchParams.size) {
                setSearchParams({});
            }

            return;
        }

        // Don't update query params if we're copying from existing provider
        const queryId = searchParams.get('id');
        if (queryId) {
            return;
        }

        // Don't update query params on initial load if we're reading from query params
        const queryType = searchParams.get('type');
        if (!selectedType && queryType) {
            return;
        }

        // Update query parameter based on selected type
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (selectedType) {
                params.set('type', selectedType);
            } else {
                params.delete('type');
            }
            return params;
        });
    }, [selectedType, setSearchParams, isNew, searchParams]); // Include searchParams since we read from it

    // Fill form with data when available
    useEffect(() => {
        if (!data?.settingsProviders) {
            return;
        }

        const providers = data.settingsProviders;

        if (isNew || !providerId) {
            // For new provider, start with empty form but check for type query parameter
            const queryType = formQueryParams.type ?? undefined;
            const queryId = formQueryParams.id;

            // If we have an id in query params, copy from existing provider
            if (queryId && data?.settingsProviders?.userDefined) {
                const sourceProvider = data.settingsProviders.userDefined.find((p: Provider) => p.id === +queryId);

                if (sourceProvider) {
                    const { name, type: sourceType, agents } = sourceProvider;

                    form.reset({
                        name: `${name} (Copy)`,
                        type: sourceType ?? undefined,
                        agents: agents ? (normalizeGraphQLData(agents) as FormAgents) : {},
                    });

                    return;
                }
            }

            // Default new provider form - but only if selectedType is not set
            // to avoid conflicts with agent filling useEffect
            if (!selectedType) {
                form.reset({
                    name: undefined,
                    type: queryType,
                    agents: {},
                });
            }
            return;
        }

        const provider = providers.userDefined?.find((provider: Provider) => provider.id === +providerId);

        if (!provider) {
            navigate('/settings/providers');
            return;
        }

        const { name, type, agents } = provider;

        form.reset({
            name: name || undefined,
            type: type || undefined,
            agents: agents ? (normalizeGraphQLData(agents) as FormAgents) : {},
        });
    }, [data, isNew, providerId, form, formQueryParams, selectedType]);

    const onSubmit = async (formData: FormData) => {
        try {
            setSubmitError(null);

            const mutationData = transformFormToGraphQL(formData);

            if (isNew) {
                // Create new provider
                await createProvider({
                    variables: mutationData,
                    refetchQueries: ['settingsProviders'],
                });
            } else {
                // Update existing provider
                await updateProvider({
                    variables: {
                        ...mutationData,
                        providerId: providerId!,
                    },
                    refetchQueries: ['settingsProviders'],
                });
            }

            // Navigate back to providers list on success
            navigate('/settings/providers');
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving');
        }
    };

    const onDelete = async () => {
        if (isNew || !providerId) return;

        try {
            setSubmitError(null);

            await deleteProvider({
                variables: { providerId },
                refetchQueries: ['settingsProviders'],
            });

            // Navigate back to providers list on success
            navigate('/settings/providers');
        } catch (error) {
            console.error('Delete error:', error);
            setSubmitError(error instanceof Error ? error.message : 'An error occurred while deleting');
        }
    };

    const onTest = async () => {
        // Trigger form validation
        const isValid = await form.trigger();

        if (!isValid) {
            const errors = form.formState.errors;

            // Helper function to format field names for display
            const formatFieldName = (fieldPath: string): string => {
                return fieldPath
                    .split('.')
                    .map((part) => {
                        // Capitalize first letter and add spaces before uppercase letters
                        return part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1');
                    })
                    .join(' → ');
            };

            // Show validation errors to user
            const errorMessages = Object.entries(errors)
                .map(([field, error]: [string, any]) => {
                    if (error?.message) {
                        return `• ${formatFieldName(field)}: ${error.message}`;
                    }
                    if (error && typeof error === 'object') {
                        // Handle nested errors (like agents.simple.model)
                        return Object.entries(error)
                            .map(([subField, subError]: [string, any]) => {
                                if (subError?.message) {
                                    return `• ${formatFieldName(`${field}.${subField}`)}: ${subError.message}`;
                                }
                                if (subError && typeof subError === 'object') {
                                    return Object.entries(subError)
                                        .map(([nestedField, nestedError]: [string, any]) => {
                                            if (nestedError?.message) {
                                                return `• ${formatFieldName(`${field}.${subField}.${nestedField}`)}: ${nestedError.message}`;
                                            }
                                            return null;
                                        })
                                        .filter(Boolean)
                                        .join('\n');
                                }
                                return null;
                            })
                            .filter(Boolean)
                            .join('\n');
                    }
                    return null;
                })
                .filter(Boolean)
                .join('\n');

            setSubmitError(`Please fix the following validation errors:\n\n${errorMessages}`);

            return;
        }

        try {
            setSubmitError(null);

            // Get form data and transform it
            const formData = form.getValues();
            const mutationData = transformFormToGraphQL(formData);

            const result = await testProvider({
                variables: {
                    type: mutationData.type,
                    agents: mutationData.agents,
                },
            });

            // Save results and open dialog
            setTestResults(result.data?.testProvider);
            setTestDialogOpen(true);
        } catch (error) {
            console.error('Test error:', error);
            setSubmitError(error instanceof Error ? error.message : 'An error occurred while testing');
        }
    };

    if (loading) {
        return (
            <StatusCard
                icon={<Loader2 className="w-16 h-16 animate-spin text-muted-foreground" />}
                title="Loading provider data..."
                description="Please wait while we fetch provider configuration"
            />
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading provider data</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        );
    }

    const providers = data?.settingsProviders?.models
        ? Object.keys(data?.settingsProviders.models).filter((key) => key !== '__typename')
        : [];

    const mutationError = createError || updateError || deleteError || testError || submitError;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardDescription>
                        {isNew
                            ? 'Configure a new language model provider'
                            : 'Update provider settings and configuration'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            id="provider-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Error Alert */}
                            {mutationError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        {mutationError instanceof Error ? (
                                            mutationError.message
                                        ) : (
                                            <div className="whitespace-pre-line">{mutationError}</div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Form fields */}
                            <FormComboboxItem
                                name="type"
                                label="Type"
                                placeholder="Select provider"
                                options={providers}
                                control={form.control}
                                disabled={isLoading || !!selectedType}
                                allowCustom={false}
                                description="The type of language model provider"
                            />

                            <FormInputStringItem
                                name="name"
                                label="Name"
                                placeholder="Enter provider name"
                                control={form.control}
                                disabled={isLoading}
                                description="A unique name for your provider configuration"
                            />

                            {/* Agents Configuration Section */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium">Agent Configurations</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure settings for each agent type
                                    </p>
                                </div>

                                <Accordion
                                    type="multiple"
                                    className="w-full"
                                >
                                    {agentTypes.map((agentKey, index) => (
                                        <AccordionItem
                                            key={agentKey}
                                            value={agentKey}
                                        >
                                            <AccordionTrigger className="text-left">
                                                {getName(agentKey)}
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-[1px]">
                                                    {/* Model field */}
                                                    <FormModelComboboxItem
                                                        name={`agents.${agentKey}.model`}
                                                        label="Model"
                                                        placeholder="Select or enter model name"
                                                        options={availableModels}
                                                        control={form.control}
                                                        disabled={isLoading}
                                                    />

                                                    {/* Temperature field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.temperature`}
                                                        label="Temperature"
                                                        placeholder="0.7"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        step="0.1"
                                                        min="0"
                                                        max="2"
                                                    />

                                                    {/* Max Tokens field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.maxTokens`}
                                                        label="Max Tokens"
                                                        placeholder="1000"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        min="1"
                                                        valueType="integer"
                                                    />

                                                    {/* Top P field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.topP`}
                                                        label="Top P"
                                                        placeholder="0.9"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        step="0.01"
                                                        min="0"
                                                        max="1"
                                                    />

                                                    {/* Top K field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.topK`}
                                                        label="Top K"
                                                        placeholder="40"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        min="1"
                                                        valueType="integer"
                                                    />

                                                    {/* Min Length field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.minLength`}
                                                        label="Min Length"
                                                        placeholder="0"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        min="0"
                                                        valueType="integer"
                                                    />

                                                    {/* Max Length field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.maxLength`}
                                                        label="Max Length"
                                                        placeholder="2000"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        min="1"
                                                        valueType="integer"
                                                    />

                                                    {/* Repetition Penalty field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.repetitionPenalty`}
                                                        label="Repetition Penalty"
                                                        placeholder="1.0"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        step="0.01"
                                                        min="0"
                                                        max="2"
                                                    />

                                                    {/* Frequency Penalty field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.frequencyPenalty`}
                                                        label="Frequency Penalty"
                                                        placeholder="0.0"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        step="0.01"
                                                        min="0"
                                                        max="2"
                                                    />

                                                    {/* Presence Penalty field */}
                                                    <FormInputNumberItem
                                                        name={`agents.${agentKey}.presencePenalty`}
                                                        label="Presence Penalty"
                                                        placeholder="0.0"
                                                        control={form.control}
                                                        disabled={isLoading}
                                                        step="0.01"
                                                        min="0"
                                                        max="2"
                                                    />
                                                </div>

                                                {/* Reasoning Configuration */}
                                                <div className="col-span-full p-[1px]">
                                                    <div className="mt-6 space-y-4">
                                                        <h4 className="text-sm font-medium">Reasoning Configuration</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Reasoning Effort field */}
                                                            <FormField
                                                                control={form.control}
                                                                name={`agents.${agentKey}.reasoning.effort`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Reasoning Effort</FormLabel>
                                                                        <Select
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value || undefined}
                                                                            disabled={isLoading}
                                                                        >
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select effort level (optional)" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                <SelectItem value={ReasoningEffort.Low}>
                                                                                    Low
                                                                                </SelectItem>
                                                                                <SelectItem
                                                                                    value={ReasoningEffort.Medium}
                                                                                >
                                                                                    Medium
                                                                                </SelectItem>
                                                                                <SelectItem
                                                                                    value={ReasoningEffort.High}
                                                                                >
                                                                                    High
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            {/* Reasoning Max Tokens field */}
                                                            <FormInputNumberItem
                                                                name={`agents.${agentKey}.reasoning.maxTokens`}
                                                                label="Reasoning Max Tokens"
                                                                placeholder="1000"
                                                                control={form.control}
                                                                disabled={isLoading}
                                                                min="1"
                                                                valueType="integer"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price Configuration */}
                                                <div className="col-span-full p-[1px]">
                                                    <div className="mt-6 space-y-4">
                                                        <h4 className="text-sm font-medium">Price Configuration</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Price Input field */}
                                                            <FormInputNumberItem
                                                                name={`agents.${agentKey}.price.input`}
                                                                label="Input Price"
                                                                placeholder="0.001"
                                                                control={form.control}
                                                                disabled={isLoading}
                                                                step="0.000001"
                                                                min="0"
                                                            />

                                                            {/* Price Output field */}
                                                            <FormInputNumberItem
                                                                name={`agents.${agentKey}.price.output`}
                                                                label="Output Price"
                                                                placeholder="0.002"
                                                                control={form.control}
                                                                disabled={isLoading}
                                                                step="0.000001"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Sticky buttons at bottom */}
            <div className="flex items-center sticky -bottom-4 bg-background border-t mt-4 -mx-4 -mb-4 p-4 shadow-lg">
                <div className="flex space-x-2">
                    {/* Delete button - only show when editing existing provider */}
                    {!isNew && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isLoading}
                        >
                            {isDeleteLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {isDeleteLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onTest}
                        disabled={isLoading || isTestLoading}
                    >
                        {isTestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        {isTestLoading ? 'Testing...' : 'Test'}
                    </Button>
                </div>

                <div className="flex space-x-2 ml-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/settings/providers')}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        form="provider-form"
                        variant="secondary"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isLoading ? 'Saving...' : isNew ? 'Create Provider' : 'Update Provider'}
                    </Button>
                </div>
            </div>

            <TestResultsDialog
                open={testDialogOpen}
                onOpenChange={setTestDialogOpen}
                results={testResults}
            />
        </>
    );
};

export default SettingsProvider;
