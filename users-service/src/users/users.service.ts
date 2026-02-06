import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      password: 'password123', // Demo password
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      createdAt: new Date('2024-01-15'),
      password: 'password123', // Demo password
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user',
      createdAt: new Date('2024-02-01'),
      password: 'password123', // Demo password
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  create(name: string, email: string, role?: string, password?: string): User {
    const newUser: User = {
      id: String(this.users.length + 1),
      name,
      email,
      role: role || 'user',
      createdAt: new Date(),
      password: password, // Store password (in production, this should be hashed)
    };
    this.users.push(newUser);
    return newUser;
  }
}
