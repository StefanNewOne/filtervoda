import { GenericCrud } from '../components/GenericCrud';

export default function Categories() {
  return (
    <GenericCrud
      title="Категории"
      subtitle="Групи на производи, редослед и слики"
      endpoint="/admin/categories"
      queryKey="categories"
      fields={[
        { key: 'name', label: 'Име' },
        { key: 'slug', label: 'Slug' },
        { key: 'sortOrder', label: 'Редослед', type: 'number' },
      ]}
    />
  );
}
