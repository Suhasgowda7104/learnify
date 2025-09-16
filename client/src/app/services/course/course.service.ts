import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface CourseContent {
  id: string;
  title: string;
  contentType: 'pdf' | 'text';
  filePath: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  durationHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enrollment_count?: number;
  contents?: CourseContent[];
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course | Course[];
  total?: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  durationHours: number;
  isActive?: boolean;
}

export interface CourseStats {
  total_courses: number;
  active_courses: number;
  total_enrollments: number;
  total_students: number;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private adminApiUrl = 'http://localhost:5000/api/v1/admin';
  private publicApiUrl = 'http://localhost:5000/api/v1/courses';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createCourse(courseData: CreateCourseData): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<CourseResponse>(`${this.adminApiUrl}/courses`, courseData, { headers });
  }

  getAdminCourses(): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<CourseResponse>(`${this.publicApiUrl}/`, { headers });
  }


  updateCourse(courseId: string, courseData: Partial<CreateCourseData>): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<CourseResponse>(`${this.adminApiUrl}/courses/${courseId}`, courseData, { headers });
  }


  deleteCourse(courseId: string): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.delete<CourseResponse>(`${this.adminApiUrl}/courses/${courseId}`, { headers });
  }

  getCourseStats(): Observable<{success: boolean; data: CourseStats}> {
    const headers = this.getAuthHeaders();
    return this.http.get<{success: boolean; data: CourseStats}>(`${this.adminApiUrl}/dashboard/stats`, { headers });
  }

  getPublicCourses(): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.publicApiUrl}`);
  }

  getEnrolledCourses(): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    console.log('🔍 CourseService - Getting enrolled courses with headers:', headers);
    
    return this.http.get<any>('http://localhost:5000/api/v1/student/enrollments', { headers })
      .pipe(
        map((response: any) => {
          console.log('📊 CourseService - Enrolled courses response:', response);
          if (response.success && response.data) {
            // Transform enrollment data to course format
            const courses = response.data.map((enrollment: any) => enrollment.course);
            console.log('📚 CourseService - Transformed courses:', courses);
            return {
              success: true,
              data: courses,
              message: response.message
            };
          }
          return response;
        })
      );
  }

  getCourseById(courseId: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.publicApiUrl}/${courseId}`);
  }
}
