/**
 * Premium Haptic Feedback Utility (Mobile Only)
 * Uses the Web Vibration API with high safety guards for iframe sandboxes.
 */

export type HapticType = 
  | "correct"      // Light confirmation tap (12ms)
  | "incorrect"    // Firm tap (35ms)
  | "loseHeart"    // Medium tap (60ms)
  | "milestone"    // Staggered dual tap for mastery milestones
  | "complete"     // Multi-pulse celebration for stage completion
  | "theme";       // One tiny tap (10ms)

export function triggerHaptic(type: HapticType): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  try {
    switch (type) {
      case "correct":
        // Light, satisfying confirmation pulse
        navigator.vibrate(12);
        break;
      case "incorrect":
        // Slightly firmer warning pulse
        navigator.vibrate(35);
        break;
      case "loseHeart":
        // Medium cautionary nudge
        navigator.vibrate(60);
        break;
      case "milestone":
        // Staggered double-tap (vibrate, pause, vibrate)
        navigator.vibrate([15, 60, 20]);
        break;
      case "complete":
        // Celebratory rhythm: pulse, pause, pulse, pause, long-pulse
        navigator.vibrate([25, 60, 25, 60, 45]);
        break;
      case "theme":
        // Tiny structural click feedback
        navigator.vibrate(10);
        break;
      default:
        break;
    }
  } catch (error) {
    // Gracefully catch potential SecurityErrors due to sandboxed iframe permissions
    // or browser restriction policies (e.g. requires user interaction)
    console.debug("Haptic feedback not supported or blocked by sandbox permissions.", error);
  }
}
