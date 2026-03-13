import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getInitializedDataSource } from '@/lib/datasource';
import { Todo } from '@/entities/Todo';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const ds = await getInitializedDataSource();
    const repo = ds.getRepository(Todo);
    const todo = await repo.findOneBy({ id });
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error('GET /api/todos/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const ds = await getInitializedDataSource();
    const repo = ds.getRepository(Todo);
    const todo = await repo.findOneBy({ id });
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    const body = await request.json();
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      todo.title = body.title.trim();
    }
    if (body.description !== undefined) {
      todo.description = body.description ? body.description.trim() : null;
    }
    if (body.completed !== undefined) {
      todo.completed = Boolean(body.completed);
    }
    const updated = await repo.save(todo);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/todos/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const ds = await getInitializedDataSource();
    const repo = ds.getRepository(Todo);
    const todo = await repo.findOneBy({ id });
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    await repo.remove(todo);
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/todos/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
