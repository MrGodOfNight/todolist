'use client';

import { useAuth } from '@/_contexts/AuthContext';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/_types/index';
import { useState, useEffect } from 'react';

export default function TodoList() {
  const { token } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Загрузка задач с API
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${apiUrl}/api/todo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при загрузке задач');
        }

        const data: Todo[] = await response.json();
        setTodos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Error fetching todos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [token]);

  // Функция для выполнения API запросов с обработкой ошибок
  const apiRequest = async <T,>(
    url: string,
    method: string,
    body?: any
  ): Promise<T> => {
    if (!token) {
      throw new Error('Токен аутентификации отсутствует');
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Ошибка ${response.status}`);
    }

    return response.json();
  };

  const addTodo = async () => {
    if (!newTodoName.trim() || !token) return;

    setOperationLoading(true);
    try {
      // Соответствует CreateTodoRequest
      const request: CreateTodoRequest = {
        name: newTodoName.trim(),
        description: newTodoDescription.trim() || undefined,
        isCompleted: false // Новая задача всегда создается как не завершенная
      };

      const newTodo = await apiRequest<Todo>(`${apiUrl}/api/todo`, 'PUT', request);
      
      setTodos([...todos, newTodo]);
      setNewTodoName('');
      setNewTodoDescription('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении задачи');
      console.error('Error adding todo:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!token) return;

    setOperationLoading(true);
    try {
      await apiRequest<Todo>(`${apiUrl}/api/todo/${id}`, 'DELETE');
      
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
      
      // Если удаляемая задача была в режиме редактирования - сбрасываем состояние
      if (editingTodo?.id === id) {
        setEditingTodo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении задачи');
      console.error('Error deleting todo:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleTodoStatus = async (id: number, currentStatus: boolean) => {
    if (!token) return;

    setOperationLoading(true);
    try {
      // Соответствует UpdateTodoRequest - все поля обязательны
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      const request: UpdateTodoRequest = {
        name: todoToUpdate.name, // Сохраняем текущее название
        description: todoToUpdate.description || undefined, // Сохраняем текущее описание
        isCompleted: !currentStatus // Меняем статус
      };

      const updatedTodo = await apiRequest<Todo>(`${apiUrl}/api/todo/${id}`, 'PATCH', request);
      
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении статуса');
      console.error('Error updating todo status:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  const updateTodo = async (id: number) => {
    if (!editName.trim() || !editingTodo || !token) return;

    setOperationLoading(true);
    try {
      // Соответствует UpdateTodoRequest - все поля обязательны
      const request: UpdateTodoRequest = {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        isCompleted: editingTodo.isCompleted // Сохраняем текущий статус
      };

      const updatedTodo = await apiRequest<Todo>(`${apiUrl}/api/todo/${id}`, 'PATCH', request);
      
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      setEditingTodo(null);
      setEditName('');
      setEditDescription('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении задачи');
      console.error('Error updating todo:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditName(todo.name);
    setEditDescription(todo.description || '');
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditName('');
    setEditDescription('');
  };

  const clearCompleted = async () => {
    if (!token) return;

    const completedIds = todos.filter(todo => todo.isCompleted).map(todo => todo.id);
    if (completedIds.length === 0) return;

    setOperationLoading(true);
    try {
      // Удаляем все завершенные задачи параллельно
      await Promise.all(
        completedIds.map(id => apiRequest<Todo>(`${apiUrl}/api/todo/${id}`, 'DELETE'))
      );
      
      setTodos(todos.filter(todo => !todo.isCompleted));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при очистке завершенных задач');
      console.error('Error clearing completed todos:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  const activeTodos = todos.filter(todo => !todo.isCompleted);
  const completedTodos = todos.filter(todo => todo.isCompleted);

  if (!token) {
    return (
      <div>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-blue-600 dark:bg-gray-700">
              <h1 className="text-2xl font-bold text-white text-center">Список задач</h1>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Пожалуйста, авторизуйтесь для доступа к списку задач
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4">
        <section className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 bg-blue-600 dark:bg-gray-700">
            <h1 className="text-2xl font-bold text-white text-center">Список задач</h1>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Форма добавления новой задачи */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Новая задача</h2>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Название задачи"
                    value={newTodoName}
                    onChange={(e) => setNewTodoName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !operationLoading && addTodo()}
                    disabled={loading || operationLoading}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      loading || operationLoading 
                        ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Описание задачи (необязательно)"
                    value={newTodoDescription}
                    onChange={(e) => setNewTodoDescription(e.target.value)}
                    disabled={loading || operationLoading}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      loading || operationLoading 
                        ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-20 resize-none`}
                  />
                </div>
                <button
                  onClick={addTodo}
                  disabled={!newTodoName.trim() || loading || operationLoading}
                  className={`w-full py-2 font-medium rounded-lg transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    !newTodoName.trim() || loading || operationLoading
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg focus:ring-blue-500'
                  }`}
                >
                  {operationLoading ? 'Добавление...' : 'Добавить задачу'}
                </button>
              </div>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Загрузка */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Активные задачи */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                    <span className="mr-2">📋</span> Активные задачи ({activeTodos.length})
                  </h2>
                  
                  {activeTodos.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Нет активных задач
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeTodos.map(todo => (
                        <div 
                          key={todo.id} 
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 
                          hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                        >
                          {editingTodo?.id === todo.id ? (
                            // Режим редактирования
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !operationLoading && updateTodo(todo.id)}
                                disabled={operationLoading}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  operationLoading 
                                    ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600' 
                                    : 'border-blue-300 dark:border-blue-600'
                                } bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none 
                                focus:ring-2 focus:ring-blue-500`}
                                autoFocus
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                disabled={operationLoading}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  operationLoading 
                                    ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600' 
                                    : 'border-blue-300 dark:border-blue-600'
                                } bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none 
                                focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none`}
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={cancelEdit}
                                  disabled={operationLoading}
                                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    operationLoading
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                                  }`}
                                >
                                  Отмена
                                </button>
                                <button
                                  onClick={() => updateTodo(todo.id)}
                                  disabled={!editName.trim() || operationLoading}
                                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    !editName.trim() || operationLoading
                                      ? 'bg-gray-400 text-white cursor-not-allowed opacity-70'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {operationLoading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Обычный режим
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800 dark:text-white text-lg">{todo.name}</h3>
                                {todo.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {todo.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 ml-4">
                                <button 
                                  onClick={() => startEditing(todo)}
                                  disabled={operationLoading}
                                  className={`text-xl transition-colors duration-200 ${
                                    operationLoading
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                  }`} 
                                  title="Редактировать"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => deleteTodo(todo.id)}
                                  disabled={operationLoading}
                                  className={`text-xl transition-colors duration-200 ${
                                    operationLoading
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                  }`} 
                                  title="Удалить"
                                >
                                  🗑️
                                </button>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={todo.isCompleted}
                                    onChange={() => toggleTodoStatus(todo.id, todo.isCompleted)}
                                    disabled={operationLoading}
                                    aria-label="Отметить задачу как выполненную"
                                  />
                                  <div className={`w-11 h-6 rounded-full peer ${
                                    operationLoading
                                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                      : 'bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-green-500'
                                  } peer-checked:after:translate-x-full
                                  peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                  dark:border-gray-600`}/>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Завершенные задачи */}
                {completedTodos.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      <span className="mr-2">✅</span> Завершенные задачи ({completedTodos.length})
                    </h2>
                    
                    <div className="space-y-3">
                      {completedTodos.map(todo => (
                        <div 
                          key={todo.id} 
                          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 
                          opacity-80 hover:opacity-100 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800 dark:text-white text-lg line-through">{todo.name}</h3>
                              {todo.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-through">
                                  {todo.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              <button 
                                onClick={() => toggleTodoStatus(todo.id, todo.isCompleted)}
                                disabled={operationLoading}
                                className={`text-xl transition-colors duration-200 ${
                                  operationLoading
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                }`} 
                                title="Восстановить"
                              >
                                ↩️
                              </button>
                              <button 
                                onClick={() => deleteTodo(todo.id)}
                                disabled={operationLoading}
                                className={`text-xl transition-colors duration-200 ${
                                  operationLoading
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                }`} 
                                title="Удалить"
                              >
                                🗑️
                              </button>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={todo.isCompleted}
                                  onChange={() => toggleTodoStatus(todo.id, todo.isCompleted)}
                                  disabled={operationLoading}
                                  aria-label="Отметить задачу как невыполненную"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  operationLoading
                                    ? 'bg-green-300 dark:bg-green-700 cursor-not-allowed'
                                    : 'bg-green-200 dark:bg-green-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-gray-400'
                                } peer-checked:after:translate-x-full
                                peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                                after:border-green-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                dark:border-green-600`}/>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={clearCompleted}
                      disabled={operationLoading}
                      className={`w-full py-2 font-medium rounded-xl transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        operationLoading
                          ? 'bg-gray-400 cursor-not-allowed opacity-70'
                          : 'bg-gray-600 hover:bg-gray-700 text-white hover:shadow-lg focus:ring-gray-500'
                      }`}
                    >
                      {operationLoading ? 'Очистка...' : 'Очистить завершенные задачи'}
                    </button>
                  </div>
                )}

                {/* Информационный баннер */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg
                  border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                    Все задачи сохраняются на сервере. Изменения применяются мгновенно.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}