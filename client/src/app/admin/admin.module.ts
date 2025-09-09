import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CourseFormComponent } from './course-form/course-form.component';



@NgModule({
  declarations: [
    AdminDashboardComponent,
    CourseFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class AdminModule { }
