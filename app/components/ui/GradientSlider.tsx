import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@sruim/nexus-design';

interface GradientSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
  valueLabel?: string;
}

export function GradientSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  showValue = false,
  valueLabel = '',
}: GradientSliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="relative flex w-full touch-none select-none items-center group"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-800">
          <SliderPrimitive.Range
            className="absolute h-full rounded-full bg-gradient-to-r from-[#f87171] to-[#fb923c]"
            style={{ width: `${percentage}%` }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block size-5 rounded-full bg-white',
            'border-2 border-orange-400',
            'shadow-lg shadow-orange-500/30',
            'ring-offset-slate-900 transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:scale-110 hover:shadow-xl hover:shadow-orange-500/50',
            'active:scale-95'
          )}
        />
      </SliderPrimitive.Root>

      {showValue && (
        <div className="min-w-[70px] rounded-md bg-slate-800/60 px-3 py-1 text-center backdrop-blur-sm border border-slate-700">
          <span className="text-sm font-medium text-orange-400">{value[0]}</span>
          {valueLabel && <span className="text-xs text-slate-400 ml-1">{valueLabel}</span>}
        </div>
      )}
    </div>
  );
}
