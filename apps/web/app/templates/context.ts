import type { TemplateId } from '@filtervoda/shared';
import { useRouteLoaderData } from 'react-router';

/** Read the active template id from the root loader (mirrors <html data-template>). */
export function useTemplateId(): TemplateId {
  const root = useRouteLoaderData('root') as { settings?: { activeTemplate?: TemplateId } } | undefined;
  return root?.settings?.activeTemplate ?? 'b1';
}
