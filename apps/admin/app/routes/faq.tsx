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
        {
          key: 'scope',
          label: 'Опсег',
          type: 'select',
          defaultValue: 'GLOBAL',
          options: [
            { value: 'GLOBAL', label: 'Глобално (цел сајт)' },
            { value: 'PRODUCT', label: 'По производ' },
            { value: 'B2B', label: 'За фирми' },
          ],
        },
        { key: 'sortOrder', label: 'Редослед', type: 'number', defaultValue: '0' },
      ]}
    />
  );
}
