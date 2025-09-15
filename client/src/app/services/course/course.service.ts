import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

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
    return this.http.get<CourseResponse>(`${this.adminApiUrl}/courses`, { headers });
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

  getCourseById(courseId: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.publicApiUrl}/${courseId}`);
  }
}
