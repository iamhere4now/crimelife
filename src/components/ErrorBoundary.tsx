"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches a crash inside one part of the game (a crime scene, say) so the rest
 * keeps running, and shows `fallback` with a way to try again.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; fallback: (retry: () => void) => ReactNode }, { failed: boolean; round: number }> {
  state = { failed: false, round: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[naija-detective] a part of the game crashed", error);
  }

  retry = () => this.setState((s) => ({ failed: false, round: s.round + 1 }));

  render() {
    if (this.state.failed) return this.props.fallback(this.retry);
    // a new round remounts the children from scratch
    return <div key={this.state.round} className="contents">{this.props.children}</div>;
  }
}
