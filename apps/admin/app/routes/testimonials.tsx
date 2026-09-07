import { GenericCrud } from '../components/GenericCrud';

export default function Testimonials() {
  return (
    <GenericCrud
      title="Искуства на клиенти"
      subtitle="Изјави за домаќинства и за фирми, со оценка и производ"
      endpoint="/admin/testimonials"
      queryKey="testimonials"
      fields={[
        { key: 'name', label: 'Име' },
        { key: 'company', label: 'Фирма' },
        { key: 'city', label: 'Град' },
        { key: 'text', label: 'Текст' },
        { key: 'rating', label: 'Оценка (1–5)', type: 'number', defaultValue: '5' },
        {
          key: 'scope',
          label: 'Опсег',
          type: 'select',
          defaultValue: 'B2C',
          options: [
            { value: 'B2C', label: 'Домаќинства (B2C)' },
            { value: 'B2B', label: 'Фирми (B2B)' },
          ],
        },
      ]}
    />
  );
}
