import { Image } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ScreenshotFragmentFragment } from '@/graphql/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';
import { baseUrl } from '@/models/Api';

interface ChatScreenshotProps {
    screenshot: ScreenshotFragmentFragment;
}

const ChatScreenshot = ({ screenshot }: ChatScreenshotProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = imageRef.current;
        const config = {
            rootMargin: '200px',
        };
        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, config);

        if (element) {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col items-start">
            <div
                className={cn('max-w-full rounded-lg bg-accent p-3 text-accent-foreground', isExpanded ? 'w-full' : '')}
            >
                <div className="flex flex-col">
                    <div className="cursor-pointer text-sm font-semibold">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    to={screenshot.url}
                                    target="_blank"
                                    className={cn(
                                        buttonVariants({ variant: 'link' }),
                                        'inline-flex h-auto max-w-full items-center gap-1 p-0',
                                    )}
                                >
                                    <Image className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate font-semibold">{screenshot.url}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Source URL</TooltipContent>
                        </Tooltip>
                    </div>

                    <div
                        ref={imageRef}
                        className={cn('mt-2 w-full', !isVisible ? 'animate-pulse' : '')}
                    >
                        {isVisible ? (
                            <div className={`${isExpanded ? 'size-full' : 'h-[240px] w-[320px]'}`}>
                                <img
                                    src={`${baseUrl}/flows/${screenshot.flowId}/screenshots/${screenshot.id}/file`}
                                    alt={screenshot.name}
                                    loading="lazy"
                                    className={cn(
                                        'size-full transition-all duration-200',
                                        isExpanded ? 'cursor-zoom-out' : 'cursor-zoom-in object-cover object-top',
                                    )}
                                    onClick={() => setIsExpanded(!isExpanded)}
                                />
                            </div>
                        ) : (
                            <div className="h-[240px] w-[320px] rounded-lg bg-slate-200" />
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-1 flex items-center gap-1 px-1 text-xs text-muted-foreground/50">
                {formatDate(new Date(screenshot.createdAt))}
            </div>
        </div>
    );
};

export default memo(ChatScreenshot);
