'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

type Todo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Filter = 'all' | 'active' | 'completed';

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Title is required.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create todo');
      }
      const created = await res.json();
      setTodos((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create todo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      setError('Failed to toggle todo status.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete todo.');
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditError(null);
  };

  const handleEdit = async (id: number) => {
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update todo');
      }
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEdit();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>📝 Todo App</h1>
          <p className={styles.subtitle}>Stay organized, stay productive</p>
        </header>

        {/* Create Form */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Add New Todo</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder="Todo title *"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={submitting}
                maxLength={500}
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                className={styles.textarea}
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={submitting}
                rows={2}
              />
            </div>
            {formError && <p className={styles.errorMsg}>{formError}</p>}
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Adding...' : '+ Add Todo'}
            </button>
          </form>
        </section>

        {/* Stats */}
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.statNum}>{todos.length}</span> Total
          </span>
          <span className={styles.stat}>
            <span className={styles.statNum}>{activeCount}</span> Active
          </span>
          <span className={styles.stat}>
            <span className={styles.statNum}>{completedCount}</span> Completed
          </span>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterBar}>
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            {error}
            <button onClick={() => setError(null)} className={styles.dismissBtn}>✕</button>
          </div>
        )}

        {/* Todo List */}
        <section>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>Loading todos...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>🎉</p>
              <p>No {filter !== 'all' ? filter : ''} todos found.</p>
              {filter === 'all' && <p>Add your first todo above!</p>}
            </div>
          ) : (
            <ul className={styles.todoList}>
              {filteredTodos.map((todo) => (
                <li key={todo.id} className={`${styles.todoItem} ${todo.completed ? styles.todoCompleted : ''}`}>
                  {editingId === todo.id ? (
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        className={styles.input}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={editSubmitting}
                        maxLength={500}
                      />
                      <textarea
                        className={styles.textarea}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        disabled={editSubmitting}
                        rows={2}
                        placeholder="Description (optional)"
                      />
                      {editError && <p className={styles.errorMsg}>{editError}</p>}
                      <div className={styles.editActions}>
                        <button
                          className={styles.btnPrimary}
                          onClick={() => handleEdit(todo.id)}
                          disabled={editSubmitting}
                        >
                          {editSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className={styles.btnSecondary}
                          onClick={cancelEdit}
                          disabled={editSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.todoContent}>
                      <button
                        className={`${styles.checkbox} ${todo.completed ? styles.checkboxChecked : ''}`}
                        onClick={() => handleToggle(todo)}
                        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
                      >
                        {todo.completed && '✓'}
                      </button>
                      <div className={styles.todoText}>
                        <p className={styles.todoTitle}>{todo.title}</p>
                        {todo.description && (
                          <p className={styles.todoDescription}>{todo.description}</p>
                        )}
                        <p className={styles.todoDate}>
                          Created {new Date(todo.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.todoActions}>
                        <button
                          className={styles.btnEdit}
                          onClick={() => startEdit(todo)}
                          aria-label="Edit todo"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDelete(todo.id)}
                          aria-label="Delete todo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
