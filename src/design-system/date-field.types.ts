import type { DateOnly } from '@/domain/types';

export interface DateFieldProps {
  accessibilityLabel: string;
  allowClear?: boolean;
  invalid?: boolean;
  onChange: (value: DateOnly | undefined) => void;
  placeholder: string;
  value?: DateOnly;
}
