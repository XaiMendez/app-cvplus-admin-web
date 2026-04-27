import { Pipe, PipeTransform } from '@angular/core';

interface Column {
  key: string;
  label: string;
}

@Pipe({
  name: 'filterByValue',
  standalone: true
})
export class FilterByValuePipe implements PipeTransform {
  transform(items: any[], filterValue: string, columns: Column[]): any[] {
    if (!filterValue || !items) return items;

    const lowerFilter = filterValue.toLowerCase();

    return items.filter(item => {
      return columns.some(col => {
        const value = this.getValue(item, col.key);
        return value && String(value).toLowerCase().includes(lowerFilter);
      });
    });
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }
}
