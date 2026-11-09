import type { ComputedRef } from 'vue'
import type { Action } from './actions'
export interface PageController { page: ComputedRef<string>; fields: Record<string, string>; options?: (label: string) => string[]; act: (action: Action, context: string[]) => void }
