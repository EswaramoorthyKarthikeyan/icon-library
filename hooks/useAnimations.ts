/**
 * useAnimations Hook
 * Manages icon animations with various presets and export capabilities
 */

import { useState, useCallback, useMemo } from 'react';

export type AnimationType = 'spin' | 'bounce' | 'pulse' | 'fade' | 'slide' | 'flip' | 'jiggle' | 'heartbeat';
export type TimingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'cubic-bezier';

export interface AnimationPreset {
  type: AnimationType;
  duration: number; // ms
  delay: number; // ms
  iterationCount: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  timingFunction: TimingFunction;
  playbackRate: number; // 0.5 to 2
}

const DEFAULT_ANIMATION_PRESETS: Record<AnimationType, Omit<AnimationPreset, 'type'>> = {
  spin: {
    duration: 1000,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'normal',
    timingFunction: 'linear',
    playbackRate: 1,
  },
  bounce: {
    duration: 1000,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'normal',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
  pulse: {
    duration: 2000,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'alternate',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
  fade: {
    duration: 1500,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'alternate',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
  slide: {
    duration: 1000,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'alternate',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
  flip: {
    duration: 600,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'normal',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
  jiggle: {
    duration: 400,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'normal',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
  heartbeat: {
    duration: 1300,
    delay: 0,
    iterationCount: 'infinite',
    direction: 'normal',
    timingFunction: 'ease-in-out',
    playbackRate: 1,
  },
};

export const ANIMATION_TYPES: AnimationType[] = [
  'spin', 'bounce', 'pulse', 'fade', 'slide', 'flip', 'jiggle', 'heartbeat',
];

const TIMING_FUNCTIONS: TimingFunction[] = [
  'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'
];

/**
 * Generate CSS keyframes for a given animation type
 */
export const generateKeyframes = (type: AnimationType): string => {
  const keyframesMap: Record<AnimationType, string> = {
    spin: `
      @keyframes a-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    bounce: `
      @keyframes a-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `,
    pulse: `
      @keyframes a-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    fade: `
      @keyframes a-fade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `,
    slide: `
      @keyframes a-slide {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(15px); }
      }
    `,
    flip: `
      @keyframes a-flip {
        0%, 100% { transform: rotateY(0deg); }
        50% { transform: rotateY(180deg); }
      }
    `,
    jiggle: `
      @keyframes a-jiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
      }
    `,
    heartbeat: `
      @keyframes a-heartbeat {
        0%, 100% { transform: scale(1); }
        14% { transform: scale(1.3); }
        28% { transform: scale(1); }
        42% { transform: scale(1.3); }
        70% { transform: scale(1); }
      }
    `,
  };

  return keyframesMap[type];
};

/**
 * Generate CSS animation property string
 */
export const generateCSSAnimation = (animation: AnimationPreset): string => {
  const { type, duration, delay, iterationCount, direction, timingFunction, playbackRate } = animation;
  const iterationStr = typeof iterationCount === 'number' ? iterationCount : iterationCount;
  const durationMs = (duration / playbackRate) / 1000;
  const delayMs = (delay / 1000).toFixed(2);

  return `a-${type} ${durationMs.toFixed(2)}s ${timingFunction} ${delayMs}s ${iterationStr} ${direction}`;
};

/**
 * Generate CSS rule including keyframes
 */
export const generateCSSRule = (animationName: string, animation: AnimationPreset): string => {
  const keyframes = generateKeyframes(animation.type);
  const animationProp = generateCSSAnimation(animation);

  return `
${keyframes}

.${animationName} {
  animation: ${animationProp};
}
  `.trim();
};

/**
 * Generate exported CSS with all necessary rules
 */
export const generateExportableCSS = (animations: Record<string, AnimationPreset>): string => {
  const keyframesSeen = new Set<AnimationType>();
  let css = '/* Icon Animations - Auto Generated */\n\n';

  // Add unique keyframes first
  for (const animation of Object.values(animations)) {
    if (!keyframesSeen.has(animation.type)) {
      css += generateKeyframes(animation.type) + '\n\n';
      keyframesSeen.add(animation.type);
    }
  }

  // Add animation rules
  for (const [name, animation] of Object.entries(animations)) {
    const animationProp = generateCSSAnimation(animation);
    css += `.${name} {\n`;
    css += `  animation: ${animationProp};\n`;
    css += `}\n\n`;
  }

  return css;
};

/**
 * Generate SVG animation (SMIL) for embedded animations
 */
export const generateSVGAnimation = (type: AnimationType, duration: number, repeatCount: 'indefinite' | number = 'indefinite'): string => {
  const durationMs = `${duration / 1000}s`;

  const animationMap: Record<AnimationType, string> = {
    spin: `<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    bounce: `<animateTransform attributeName="transform" type="translate" from="0,0" to="0,-20" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    pulse: `<animate attributeName="opacity" from="1" to="0.5" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    fade: `<animate attributeName="opacity" from="1" to="0" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    slide: `<animateTransform attributeName="transform" type="translate" from="0,0" to="15,0" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    flip: `<animateTransform attributeName="transform" type="rotateY" from="0" to="180" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    jiggle: `<animateTransform attributeName="transform" type="rotate" from="-5" to="5" dur="${durationMs}" repeatCount="${repeatCount}" />`,
    heartbeat: `<animate attributeName="r" from="10" to="13" dur="${durationMs}" repeatCount="${repeatCount}" />`,
  };

  return animationMap[type] || '';
};

export const useAnimations = (defaultType: AnimationType = 'spin') => {
  const [animations, setAnimations] = useState<Record<string, AnimationPreset>>({
    default: {
      type: defaultType,
      ...DEFAULT_ANIMATION_PRESETS[defaultType],
    },
  });

  const [activeAnimationName, setActiveAnimationName] = useState('default');

  /**
   * Add or update an animation preset
   */
  const setAnimation = useCallback((name: string, preset: AnimationPreset) => {
    setAnimations((prev) => ({
      ...prev,
      [name]: preset,
    }));
  }, []);

  /**
   * Update animation properties
   */
  const updateAnimation = useCallback((
    name: string,
    updates: Partial<AnimationPreset>
  ) => {
    setAnimations((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        ...updates,
      },
    }));
  }, []);

  /**
   * Create a new animation from a preset
   */
  const createFromPreset = useCallback((name: string, type: AnimationType) => {
    setAnimation(name, {
      type,
      ...DEFAULT_ANIMATION_PRESETS[type],
    });
  }, [setAnimation]);

  /**
   * Delete an animation
   */
  const deleteAnimation = useCallback((name: string) => {
    if (name === 'default' || Object.keys(animations).length === 1) return;

    setAnimations((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    if (activeAnimationName === name) {
      setActiveAnimationName('default');
    }
  }, [activeAnimationName, animations]);

  /**
   * Reset animation to defaults
   */
  const resetAnimation = useCallback((name: string) => {
    const animation = animations[name];
    if (animation) {
      setAnimation(name, {
        ...animation,
        ...DEFAULT_ANIMATION_PRESETS[animation.type],
      });
    }
  }, [animations, setAnimation]);

  /**
   * Get current active animation
   */
  const activeAnimation = useMemo(
    () => animations[activeAnimationName] || animations['default'],
    [animations, activeAnimationName]
  );

  /**
   * Export all animations as CSS
   */
  const exportAsCSS = useCallback(() => {
    return generateExportableCSS(animations);
  }, [animations]);

  /**
   * Export animation as individual CSS rule
   */
  const exportAnimationAsCSS = useCallback((name: string) => {
    const animation = animations[name];
    if (!animation) return '';
    return generateCSSRule(name, animation);
  }, [animations]);

  return {
    animations,
    activeAnimationName,
    activeAnimation,
    setAnimations,
    setAnimation,
    updateAnimation,
    createFromPreset,
    deleteAnimation,
    resetAnimation,
    exportAsCSS,
    exportAnimationAsCSS,
  };
};

export default useAnimations;
