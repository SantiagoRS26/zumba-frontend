// services/userService.ts
import api from '@/lib/axios';
import { User } from '@/types'; // Ajusta si tienes un tipo "User" definido

export async function getAllUsers() {
  return api.get<User[]>('/users'); 
}

export async function getAllTeachers() {
  return api.get<User[]>('/users/teachers');
}