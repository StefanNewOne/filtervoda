import { GenericCrud } from '../components/GenericCrud';

export default function Redirects() {
  return (
    <GenericCrud
      title="Редирекции"
      subtitle="Стар URL (пр. /123/) → нов URL (пр. /proizvod/...) со 301"
      endpoint="/admin/redirects"
      queryKey="redirects"
      fields={[
        { key: 'fromPath', label: 'Стар URL (почнува со /)' },
        { key: 'toPath', label: 'Нов URL (почнува со /)' },
        {
          key: 'statusCode',
          label: 'Код',
          type: 'select',
          defaultValue: '301',
          options: [
            { value: '301', label: '301 (трајно)' },
            { value: '302', label: '302 (привремено)' },
          ],
        },
      ]}
    />
  );
}
