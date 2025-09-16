import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course, CourseContent } from '../../../services/course/course.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-course-detail',
  standalone: false,
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  currentUser: any = null;
  isLoading = true;
  errorMessage = '';
  courseId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.courseId = this.route.snapshot.paramMap.get('id');
    
    if (this.courseId) {
      this.loadCourseDetails(this.courseId);
    } else {
      this.errorMessage = 'Course ID not found';
      this.isLoading = false;
    }
  }

  loadCourseDetails(courseId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.courseService.getCourseById(courseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && !Array.isArray(response.data)) {
          this.course = response.data;
        } else {
          this.errorMessage = 'Course not found';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load course details';
        console.error('Error loading course details:', error);
      }
    });
  }

  goBack(): void {
    if (this.currentUser?.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/student']);
    }
  }

  editCourse(): void {
    if (this.course?.id) {
      this.router.navigate(['/course-form', this.course.id]);
    }
  }

  deleteCourse(): void {
    if (this.course?.id && confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(this.course.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/admin']);
          }
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course');
        }
      });
    }
  }

  enrollInCourse(): void {
    if (this.course?.id) {
      // TODO: Implement enrollment functionality
      console.log('Enrolling in course:', this.course.id);
      alert('Enrollment functionality will be implemented next!');
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    
    if (days < 14) {
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}