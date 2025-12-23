import { User } from '../../domain/entities/User';
import { container } from '../../infrastructure/config/container';

type Subscriber = (users: User[]) => void;

class UserStore {
  private users: User[] = [];
  private subscribers = new Set<Subscriber>();

  getUsers(): User[] {
    return this.users;
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this.users);
    return () => this.subscribers.delete(fn);
  }

  private notify() {
    this.subscribers.forEach(s => s(this.users));
  }

  async fetch(): Promise<User[]> {
    const data = await container.users.getAll();
    this.users = data;
    this.notify();
    return this.users;
  }

  async create(payload: Parameters<typeof container.users.create>[0]): Promise<User> {
    const newUser = await container.users.create(payload as any);
    this.users = [...this.users, newUser];
    this.notify();
    return newUser;
  }

  async update(id: number, payload: Parameters<typeof container.users.update>[1]): Promise<User> {
    const updated = await container.users.update(id, payload as any);
    this.users = this.users.map(u => (u.id === id ? updated : u));
    this.notify();
    return updated;
  }

  async updateState(id: number, state: boolean, currentUserId: number): Promise<boolean> {
    await container.users.updateState(id, state, currentUserId);
    if (!state) {
      this.users = this.users.filter(u => u.id !== id);
    } else {
      await this.fetch();
    }
    this.notify();
    return true;
  }

  async resetPassword(id: number): Promise<void> {
    await container.users.resetPassword(id);
    // backend does not return user data for reset; no local state change
  }

  clear() {
    this.users = [];
    this.notify();
  }
}

export const userStore = new UserStore();
