"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <p className="font-medium">Something went wrong</p>
            {this.state.message && (
              <p className="mt-1 text-xs text-red-500">{this.state.message}</p>
            )}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
