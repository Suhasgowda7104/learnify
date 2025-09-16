import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CourseService, CourseStats } from '../../services/course/course.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any = null;
  stats: CourseStats = {
    total_courses: 0,
    active_courses: 0,
    total_enrollments: 0,
    total_students: 0
  };
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

    this.loadStats();
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

  switchView(view: 'dashboard' | 'courses' | 'create'): void {
    this.currentView = view;
  }

  onCourseCreated(): void {
    this.currentView = 'courses';
    this.loadStats();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }


}