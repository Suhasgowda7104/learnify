import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../../services/course/course.service';

@Pipe({
  name: 'courseSearch',
  standalone: false
})
export class CourseSearchPipe implements PipeTransform {
  transform(courses: Course[], searchTerm: string): Course[] {
    if (!courses || !searchTerm) {
      return courses;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(term)
    );
  }
}