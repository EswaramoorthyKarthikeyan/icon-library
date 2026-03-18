
import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Optional custom fallback UI */
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Catches render errors in child components and displays a fallback UI
 * instead of crashing the entire application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    private handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <Alert variant="destructive" className="flex max-w-[500px] flex-col items-center gap-4 rounded-lg p-6">
                        <AlertCircle className="h-12 w-12" />
                        <AlertTitle className="mt-3 text-lg font-bold uppercase tracking-widest">
                            System Error
                        </AlertTitle>
                        <AlertDescription className="mb-4 font-mono text-sm opacity-80">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </AlertDescription>
                        <Button variant="destructive" size="lg" onClick={this.handleReset} className="px-6 text-xs font-bold uppercase tracking-widest">
                            Retry
                        </Button>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
