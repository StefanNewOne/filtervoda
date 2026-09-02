import { GenericCrud } from '../components/GenericCrud';

export default function Redirects() {
  return (
    <GenericCrud
      title="Редирекции"
      subtitle="Стар URL → нов URL со 301, увоз од CSV и бројач на погодоци"
      endpoint="/admin/redirects"
      queryKey="redirects"
      fields={[
        { key: 'fromPath', label: 'Стар URL' },
        { key: 'toPath', label: 'Нов URL' },
        { key: 'statusCode', label: 'Код', type: 'number' },
      ]}
    />
  );
}
