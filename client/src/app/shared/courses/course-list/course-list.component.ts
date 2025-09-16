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
  @Input() showEnrolledOnly: boolean = false;
  
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

    console.log('🔍 CourseList - Loading courses with params:', {
      showEnrolledOnly: this.showEnrolledOnly,
      isAdminView: this.isAdminView,
      currentUser: this.currentUser
    });

    let courseObservable;
    if (this.showEnrolledOnly) {
      console.log('📚 CourseList - Fetching enrolled courses only');
      courseObservable = this.courseService.getEnrolledCourses();
    } else if (this.isAdminView) {
      console.log('👑 CourseList - Fetching admin courses');
      courseObservable = this.courseService.getAdminCourses();
    } else {
      console.log('🌐 CourseList - Fetching public courses');
      courseObservable = this.courseService.getPublicCourses();
    }

    courseObservable.subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('✅ CourseList - Received response:', response);
        if (response.success) {
          this.courses = Array.isArray(response.data) ? response.data : [];
          console.log('📊 CourseList - Final courses array:', this.courses);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load courses';
        console.error('❌ CourseList - Error loading courses:', error);
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
    const weeks = Math.round(hours / (24 * 7));
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  limitDescription(description: string, wordLimit: number = 25): string {
    if (!description) return '';
    
    const words = description.trim().split(/\s+/);
    
    if (words.length <= wordLimit) {
      return description;
    }
    
    return words.slice(0, wordLimit).join(' ') + '...';
  }


  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }


  get isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }
}