import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule,CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
step = 1;
email = '';
emailError = '';
errorMsg   = '';
isLoading      = false;
resendCooldown = 0; 

private cooldownTimer: any = null;


sendResetLink(): void {

}

private startCooldown(seconds = 60): void {
  this.resendCooldown = seconds;
  this.cooldownTimer = setInterval(() => {
    this.resendCooldown--;
    if (this.resendCooldown <= 0) {
      clearInterval(this.cooldownTimer);
    }
  }, 1000);
}

ngOnDestroy(): void {
  if (this.cooldownTimer) clearInterval(this.cooldownTimer);
}
}
