import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
///models

export interface LoginRequest {
  username: string;  
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type  : string;
}

export interface UserMe {
  id        : number;
  email     : string;
  first_name: string;
  last_name : string;
  is_active : boolean;
  role      : 'admin' | 'analyst';
}

export interface CreateUserRequest {
  email     : string;
  password  : string;
  first_name: string;
  last_name : string;
  role      : 'admin' | 'analyst';
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name ?: string;
  email     ?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password    : string;
}
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API       = 'http://localhost:8000/api/v1';
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY  = 'current_user';

  constructor(private http: HttpClient, private router: Router) {}

  //login
  login(email: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<TokenResponse>(
      `${this.API}/login/access-token`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        // Charger le profil juste après le login
        this.loadUserMe().subscribe();
      })
    );
  }

//changer le proffile
  loadUserMe(): Observable<UserMe> {
    return this.http.get<UserMe>(`${this.API}/users/me`).pipe(
      tap(user => localStorage.setItem(this.USER_KEY, JSON.stringify(user)))
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

//forgot pwd
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API}/password-recovery/${encodeURIComponent(email)}`, {});
  }

//reset pwd
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API}/reset-password/`, {
      token       : token,
      new_password: newPassword
    });
  }
//admiiiiiiiiinnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
  //  admin créer un utilisateur
  createUser(data: CreateUserRequest): Observable<UserMe> {
    return this.http.post<UserMe>(`${this.API}/users/`, data);
  }

  createUserPrivate(data: CreateUserRequest): Observable<UserMe> {
    return this.http.post<UserMe>(`${this.API}/private/users/`, data);
  }

//update profile
  updateMe(data: UpdateUserRequest): Observable<UserMe> {
    return this.http.patch<UserMe>(`${this.API}/users/me`, data).pipe(
      tap(user => localStorage.setItem(this.USER_KEY, JSON.stringify(user)))
    );
  }
//change pwd
  updatePassword(data: UpdatePasswordRequest): Observable<any> {
    return this.http.patch(`${this.API}/users/me/password`, data);
  }
  //  SUPPRIMER SON COMPTE
  deleteMe(): Observable<any> {
    return this.http.delete(`${this.API}/users/me`);
  }
  getAllUsers(): Observable<UserMe[]> {
    return this.http.get<UserMe[]>(`${this.API}/users/`);
  }

  getUserById(id: number): Observable<UserMe> {
    return this.http.get<UserMe>(`${this.API}/users/${id}`);
  }
  updateUserById(id: number, data: UpdateUserRequest): Observable<UserMe> {
    return this.http.patch<UserMe>(`${this.API}/users/${id}`, data);
  }
  deleteUserById(id: number): Observable<any> {
    return this.http.delete(`${this.API}/users/${id}`);
  }
  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserMe | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isAdmin()   : boolean { return this.getUser()?.role === 'admin';   }
  isAnalyst() : boolean { return this.getUser()?.role === 'analyst'; }
}