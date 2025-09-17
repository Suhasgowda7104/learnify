import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'http://localhost:5000/api/v1/student';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Enroll in a course
   * @param courseId - Course ID to enroll in
   * @returns Observable with enrollment response
   */
  enrollInCourse(courseId: string): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<EnrollmentResponse>(
      `${this.apiUrl}/courses/${courseId}/enroll/`,
      {},
      { headers }
    );
  }

  /**
   * Get all enrollments for the current student
   * @returns Observable with enrollments
   */
  getEnrollments(): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<EnrollmentResponse>(
      `${this.apiUrl}/enrollments`,
      { headers }
    );
  }

  /**
   * Check if student is enrolled in a specific course
   * @param courseId - Course ID to check
   * @returns Observable with boolean result
   */
  isEnrolledInCourse(courseId: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getEnrollments().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const isEnrolled = response.data.some((enrollment: any) => 
              enrollment.course.id === courseId
            );
            observer.next(isEnrolled);
            observer.complete();
          } else {
            observer.next(false);
            observer.complete();
          }
        },
        error: (error) => {
          console.error('Error checking enrollment status:', error);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
