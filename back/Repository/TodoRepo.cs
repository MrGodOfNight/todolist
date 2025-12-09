using back.Domain;
using Microsoft.EntityFrameworkCore;

namespace back.Repository
{
    public interface ITodoRepo
    {
        Task<List<Todo>> GetTodos(int userId);
        Task<Todo> CreateTodo(Todo todo);
        Task<Todo> UpdateTodo(Todo todo);
        Task<Todo> DeleteTodo(int id);
    }
    public class TodoRepo : ITodoRepo
    {
        private readonly AppDbContext _context;

        public TodoRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Todo>> GetTodos(int userId)
        {
            try
            {
                return await _context.Todos.Where(t => t.UserId == userId).ToListAsync();
            }
            catch
            {
                return null;
            }
            
        }

        public async Task<Todo> CreateTodo(Todo todo)
        {
            try
            {
                _context.Todos.Add(todo);
                await _context.SaveChangesAsync();
                return todo;
            }
            catch
            {
                return null;
            }
           
        }

        public async Task<Todo> UpdateTodo(Todo todo)
        {
            try
            {
                var existingTodo = await _context.Todos.FirstOrDefaultAsync(t => t.Id == todo.Id);
                if (existingTodo == null) return null;
                if (todo.Name != null) existingTodo.Name = todo.Name;
                if (todo.Description != null) existingTodo.Description = todo.Description;
                existingTodo.IsCompleted = todo.IsCompleted;

                await _context.SaveChangesAsync();
                return existingTodo;
            }
            catch
            {
                return null;
            }
            
        }

        public async Task<Todo> DeleteTodo(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Сначала загружаем полный объект
                var todo = await _context.Todos
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (todo == null)
                {
                    await transaction.RollbackAsync();
                    return null;
                }

                // Удаляем объект
                _context.Todos.Remove(todo);

                // Сохраняем изменения
                await _context.SaveChangesAsync();

                // Фиксируем транзакцию
                await transaction.CommitAsync();

                // Возвращаем полную информацию об удаленном объекте
                return todo;
            }
            catch
            {
                await transaction.RollbackAsync();
                return null;
            }
        }
    }
}
