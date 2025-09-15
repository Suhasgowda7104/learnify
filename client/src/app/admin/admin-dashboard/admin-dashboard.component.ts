import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CourseService, Course, CourseStats } from '../../services/course/course.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any = null;
  courses: Course[] = [];
  stats: CourseStats = {
    total_courses: 0,
    active_courses: 0,
    total_enrollments: 0,
    total_students: 0
  };
  isLoading = false;
  errorMessage = '';
  currentView: 'dashboard' | 'courses' | 'create' = 'courses';

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Admin Dashboard - Current user:', this.currentUser);
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (this.currentUser?.role !== 'admin') {
      this.router.navigate(['/student']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadStats();
    this.loadCourses();
  }

  loadStats(): void {
    this.courseService.getCourseStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getAdminCourses().subscribe({
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

  switchView(view: 'dashboard' | 'courses' | 'create'): void {
    this.currentView = view;
    if (view === 'courses') {
      this.loadCourses();
    }
  }

  onCourseCreated(): void {
    this.currentView = 'courses';
    this.loadDashboardData();
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
            this.loadDashboardData();
          }
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
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
}