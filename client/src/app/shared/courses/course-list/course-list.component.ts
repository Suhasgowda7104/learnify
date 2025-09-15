import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course } from '../../../services/course/course.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent implements OnInit {
  @Input() courses: Course[] = [];
  @Input() isAdminView: boolean = false;
  @Input() showActions: boolean = true;
  
  currentUser: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.courses.length === 0) {
      this.loadCourses();
    }
  }

  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const courseObservable = this.isAdminView 
      ? this.courseService.getAdminCourses()
      : this.courseService.getPublicCourses();

    courseObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.courses = Array.isArray(response.data) ? response.data : [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load courses';
        console.error('Error loading courses:', error);
      }
    });
  }


  viewCourseDetails(courseId: string): void {
    this.router.navigate(['/course-detail', courseId]);
  }


  editCourse(courseId: string): void {
    this.router.navigate(['/course-form', courseId]);
  }

  deleteCourse(courseId: string): void {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: (response) => {
          if (response.success) {
            this.courses = this.courses.filter(course => course.id !== courseId);
          }
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course');
        }
      });
    }
  }


  enrollInCourse(courseId: string): void {
    console.log('Enrolling in course:', courseId);
    alert('Enrollment functionality will be implemented next!');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
  }


  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }


  get isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }
}