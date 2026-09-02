import { GenericCrud } from '../components/GenericCrud';

export default function Faq() {
  return (
    <GenericCrud
      title="Често поставувани прашања"
      subtitle="Глобални, по производ и за фирми"
      endpoint="/admin/faqs"
      queryKey="faqs"
      fields={[
        { key: 'question', label: 'Прашање' },
        { key: 'answer', label: 'Одговор' },
        { key: 'scope', label: 'Опсег (GLOBAL/PRODUCT/B2B)' },
        { key: 'sortOrder', label: 'Редослед', type: 'number' },
      ]}
    />
  );
}
