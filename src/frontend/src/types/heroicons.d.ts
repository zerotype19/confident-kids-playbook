declare module '@heroicons/react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    className?: string;
  }

  export const MagnifyingGlassIcon: ComponentType<IconProps>;
  export const FunnelIcon: ComponentType<IconProps>;
  export const XMarkIcon: ComponentType<IconProps>;
  export const CheckCircleIcon: ComponentType<IconProps>;
  export const ChevronDownIcon: ComponentType<IconProps>;
  export const ChevronUpIcon: ComponentType<IconProps>;
} 